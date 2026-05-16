import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { eventParticipants, events, reports, reportVotes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { USER_ROLES, ORGANIZATION_STATUSES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/reports/report-card";
import { EventCard } from "@/components/events/event-card";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myReports = await db.query.reports.findMany({
    where: eq(reports.createdById, user.id),
    with: { neighborhood: true },
    orderBy: [desc(reports.createdAt)],
    limit: 5
  });

  const myEvents = await db.query.events.findMany({
    where: eq(events.organizerId, user.id),
    with: { organizer: true, participants: true },
    orderBy: [desc(events.startsAt)],
    limit: 5
  });

  const myVotes = await db.query.reportVotes.findMany({
    where: eq(reportVotes.userId, user.id),
    with: { report: { with: { neighborhood: true } } },
    orderBy: [desc(reportVotes.updatedAt)],
    limit: 5
  });

  const myParticipations = await db.query.eventParticipants.findMany({
    where: and(eq(eventParticipants.userId, user.id), eq(eventParticipants.status, "joined")),
    with: { event: { with: { organizer: true, participants: true } } },
    orderBy: [desc(eventParticipants.createdAt)],
    limit: 5
  });

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Privatni dashboard</p>
        <h1 className="text-3xl font-black">{user.displayName}</h1>
        <p className="mt-2 text-muted-foreground">Rola: {USER_ROLES[user.role]}</p>
        {user.role === "organization" && (
          <p className="mt-2 rounded-xl bg-secondary/20 p-3 text-sm">
            Status udruge: {user.organizationStatus ? ORGANIZATION_STATUSES[user.organizationStatus] : "Nepoznato"}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Moje prijave</p><p className="text-3xl font-black">{myReports.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Moji glasovi</p><p className="text-3xl font-black">{myVotes.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Moje akcije</p><p className="text-3xl font-black">{myEvents.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Volontiranja</p><p className="text-3xl font-black">{myParticipations.length}</p></CardContent></Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Prijave koje sam pokrenuo</h2><Button asChild variant="outline"><Link href="/map">Nova prijava</Link></Button></div>
          {myReports.length === 0 ? <p className="text-muted-foreground">Još nema prijava.</p> : myReports.map((report) => <ReportCard key={report.id} report={report} />)}
        </section>
        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Akcije koje vodim</h2><Button asChild variant="outline"><Link href="/events/new">Nova akcija</Link></Button></div>
          {myEvents.length === 0 ? <p className="text-muted-foreground">Još nema akcija.</p> : myEvents.map((event) => <EventCard key={event.id} event={event} />)}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Akcije na koje volontiram</h2>
        {myParticipations.length === 0 ? <p className="text-muted-foreground">Još se nisi prijavio na akciju.</p> : myParticipations.map((item) => <EventCard key={item.id} event={item.event} />)}
      </section>
    </div>
  );
}
