import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { approveOrganizationAction, rejectOrganizationAction, updateReportStatusAction } from "@/features/admin/actions";
import { db } from "@/db";
import { reports, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ORGANIZATION_STATUSES, REPORT_CATEGORIES, REPORT_STATUSES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const reportRows = await db.query.reports.findMany({
    with: { neighborhood: true, creator: true },
    orderBy: [desc(reports.voteScore), desc(reports.createdAt)],
    limit: 20
  });

  const pendingOrganizations = await db.query.users.findMany({
    where: eq(users.organizationStatus, "pending"),
    orderBy: [desc(users.createdAt)]
  });

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-black">Admin panel</h1>
        <p className="text-muted-foreground">Ručna kontrola sustava, odobrenje udruga i status prijava.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Prijava u panelu</p><p className="text-3xl font-black">{reportRows.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Udruge čekaju</p><p className="text-3xl font-black">{pendingOrganizations.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Email gradskim službama</p><p className="text-3xl font-black">demo status</p></CardContent></Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Odobrenje udruga</h2>
        {pendingOrganizations.length === 0 ? <p className="text-muted-foreground">Nema udruga na čekanju.</p> : pendingOrganizations.map((org) => (
          <Card key={org.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h3 className="font-bold">{org.displayName}</h3>
                <p className="text-sm text-muted-foreground">{org.email} · OIB {org.organizationOib} · {org.organizationStatus ? ORGANIZATION_STATUSES[org.organizationStatus] : "Nepoznato"}</p>
              </div>
              <div className="flex gap-2">
                <form action={approveOrganizationAction.bind(null, org.id)}><Button type="submit">Odobri</Button></form>
                <form action={rejectOrganizationAction.bind(null, org.id)}><Button type="submit" variant="destructive">Odbij</Button></form>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Najglasovanije prijave</h2>
        <div className="grid gap-3">
          {reportRows.map((report) => {
            const updateStatus = updateReportStatusAction.bind(null, report.id);
            const highlightedAt = report.minPeopleNeeded + 5;
            const actionAt = report.minPeopleNeeded + 10;
            return (
              <Card key={report.id} className={report.voteScore >= highlightedAt ? "border-primary/50" : undefined}>
                <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{REPORT_CATEGORIES[report.category]}</Badge>
                      <Badge>{REPORT_STATUSES[report.status]}</Badge>
                      {report.voteScore >= actionAt && <Badge className="bg-accent text-accent-foreground">CTA prag</Badge>}
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{report.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{report.neighborhood?.name ?? "Nepoznato"} · score {report.voteScore} · min {report.minPeopleNeeded}</p>
                    <p className="mt-2 line-clamp-2 text-sm">{report.description}</p>
                  </div>
                  <div className="space-y-2">
                    <form action={updateStatus} className="space-y-2">
                      <Select name="status" defaultValue={report.status}>
                        {Object.entries(REPORT_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                      <Button type="submit" className="w-full">Spremi status</Button>
                    </form>
                    <form action={updateStatus}>
                      <input type="hidden" name="status" value="forwarded_to_city" />
                      <Button type="submit" variant="secondary" className="w-full">Odglumi slanje gradu</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
