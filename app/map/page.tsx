import { desc } from "drizzle-orm";
import { SplitMap } from "@/components/map/split-map";
import { MapWorkspace } from "@/components/map/map-workspace";
import { ReportCard } from "@/components/reports/report-card";
import { db } from "@/db";
import { neighborhoods, reports } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function MapPage() {
  const user = await getCurrentUser();
  const neighborhoodRows = await db.select({ id: neighborhoods.id, name: neighborhoods.name }).from(neighborhoods).orderBy(neighborhoods.name);
  const topReports = await db.query.reports.findMany({
    with: { neighborhood: true },
    orderBy: [desc(reports.voteScore), desc(reports.createdAt)],
    limit: 6
  });

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_420px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-black">Karta Splita</h1>
          <p className="text-muted-foreground">Kvartovi su obojani po broju aktivnih prijava. Zumiranjem vidiš konkretne prijave.</p>
        </div>
        {user ? <MapWorkspace neighborhoods={neighborhoodRows} /> : <SplitMap />}
        <div className="grid gap-3 md:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Prag isticanja</p><p className="text-2xl font-black">min + 5</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Call to action</p><p className="text-2xl font-black">min + 10</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Komentari</p><p className="text-2xl font-black">isključeni</p></CardContent></Card>
        </div>
      </section>
      <aside className="space-y-4">
        {!user && (
          <Card><CardContent className="p-5"><h2 className="text-xl font-bold">Želiš prijaviti problem?</h2><p className="mt-2 text-sm text-muted-foreground">Za prijavu problema, glasanje i volontiranje moraš biti prijavljen.</p><Button asChild className="mt-4"><Link href="/login">Prijavi se</Link></Button></CardContent></Card>
        )}
        <div className="space-y-3">
          <h2 className="text-xl font-black">Najglasovanije prijave</h2>
          {topReports.map((report) => <ReportCard key={report.id} report={report} />)}
        </div>
      </aside>
    </div>
  );
}
