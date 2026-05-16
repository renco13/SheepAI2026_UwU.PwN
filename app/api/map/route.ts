import { NextResponse } from "next/server";
import { eq, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { neighborhoods, reports } from "@/db/schema";

export async function GET() {
  const neighborhoodRows = await db
    .select({
      id: neighborhoods.id,
      name: neighborhoods.name,
      slug: neighborhoods.slug,
      geojson: neighborhoods.geojson,
      reportCount: sql<number>`count(${reports.id})::int`
    })
    .from(neighborhoods)
    .leftJoin(
      reports,
      sql`${reports.neighborhoodId} = ${neighborhoods.id} and ${reports.status} not in ('resolved', 'rejected')`
    )
    .groupBy(neighborhoods.id)
    .orderBy(neighborhoods.name);

  const reportRows = await db.query.reports.findMany({
    where: notInArray(reports.status, ["resolved", "rejected"]),
    with: { neighborhood: true, creator: true },
    orderBy: (table, { desc }) => [desc(table.voteScore), desc(table.createdAt)]
  });

  return NextResponse.json({
    neighborhoods: neighborhoodRows,
    reports: reportRows.map((report) => ({
      id: report.id,
      title: report.title,
      category: report.category,
      status: report.status,
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
      voteScore: report.voteScore,
      minPeopleNeeded: report.minPeopleNeeded,
      neighborhoodName: report.neighborhood?.name ?? "Nepoznato",
      imageUrl: report.imageUrl
    }))
  });
}
