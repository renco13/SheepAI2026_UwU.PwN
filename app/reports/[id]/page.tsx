import Image from "next/image";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { reportVotes, reports } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { REPORT_CATEGORIES, REPORT_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { VoteButtons } from "@/components/reports/vote-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const report = await db.query.reports.findFirst({
    where: eq(reports.id, params.id),
    with: { creator: true, neighborhood: true }
  });

  if (!report) notFound();

  const vote = user
    ? await db.query.reportVotes.findFirst({ where: and(eq(reportVotes.reportId, report.id), eq(reportVotes.userId, user.id)) })
    : null;

  const highlightedAt = report.minPeopleNeeded + 5;
  const actionAt = report.minPeopleNeeded + 10;

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary/30">{REPORT_CATEGORIES[report.category]}</Badge>
            <Badge>{REPORT_STATUSES[report.status]}</Badge>
            {report.voteScore >= highlightedAt && <Badge className="bg-primary text-primary-foreground">Istaknuto</Badge>}
            {report.voteScore >= actionAt && <Badge className="bg-accent text-accent-foreground">Call to action</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-black">{report.title}</h1>
          <p className="mt-2 text-muted-foreground">{report.neighborhood?.name ?? "Nepoznat kvart"} · {formatDateTime(report.createdAt)} · prijavio/la {report.creator.displayName}</p>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed">{report.description}</p>
          {report.locationDescription && <p className="mt-4 rounded-2xl bg-muted p-4 text-sm"><strong>Opis lokacije:</strong> {report.locationDescription}</p>}
          {report.imageUrl && (
            <div className="mt-6 overflow-hidden rounded-2xl border">
              <Image src={report.imageUrl} alt="Slika prijave" width={900} height={520} className="h-auto w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-xl font-black">Podrška građana</h2>
            {user ? <VoteButtons reportId={report.id} score={report.voteScore} userVote={vote?.value ?? null} /> : <p className="text-sm text-muted-foreground">Prijavi se za glasanje.</p>}
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span>Minimalno ljudi</span><strong>{report.minPeopleNeeded}</strong></div>
              <div className="flex justify-between"><span>Istaknuto na</span><strong>{highlightedAt}</strong></div>
              <div className="flex justify-between"><span>Akcija na</span><strong>{actionAt}</strong></div>
            </div>
            <Button asChild className="w-full"><Link href={`/events/new?reportId=${report.id}`}>Organiziraj akciju</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5 text-sm">
            <h2 className="text-xl font-black">Lokacija</h2>
            <p>Lat: {report.latitude}</p>
            <p>Lng: {report.longitude}</p>
            <Button asChild variant="outline" className="mt-2 w-full"><Link href="/map">Natrag na kartu</Link></Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
