// components/reports/report-card.tsx
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { REPORT_CATEGORIES, REPORT_STATUSES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReportCardProps = {
  report: {
    id: string;
    title: string;
    description: string;
    category: keyof typeof REPORT_CATEGORIES;
    status: keyof typeof REPORT_STATUSES;
    voteScore: number;
    minPeopleNeeded: number;
    neighborhood?: { name: string } | null;
  };
};

export function ReportCard({ report }: ReportCardProps) {
  const highlightedAt = report.minPeopleNeeded + 5;
  const actionAt = report.minPeopleNeeded + 10;
  const isHot = report.voteScore >= highlightedAt;
  const isActionReady = report.voteScore >= actionAt;

  return (
    <Card className={`rounded-3xl border transition-all ${
      isHot 
        ? "border-amber-200 bg-amber-50/40 shadow-xs" 
        : "border-emerald-100/80 bg-white shadow-xs"
    } p-5 relative overflow-hidden`}>
      <CardContent className="p-0 flex flex-col justify-between h-full">
        <div>
          {/* Bedževi */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-100">
              {REPORT_CATEGORIES[report.category]}
            </span>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
              report.status === "resolved" 
                ? "bg-emerald-500 text-white" 
                : "bg-slate-100 text-slate-700"
            }`}>
              {REPORT_STATUSES[report.status]}
            </span>
            {isActionReady && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-blue-500 text-white animate-pulse">
                Spremno za akciju
              </span>
            )}
          </div>

          {/* Sadržaj */}
          <h3 className="font-bold text-emerald-950 text-lg mt-3 leading-snug">{report.title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{report.description}</p>
        </div>

        {/* Donji info redak */}
        <div className="mt-5 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-slate-400">
            Kotar: <span className="font-bold text-emerald-800">{report.neighborhood?.name ?? "Nepoznat"}</span>
            <span className="mx-1.5">·</span>
            Podrška: <span className="font-black text-emerald-950">{report.voteScore}</span>
          </div>

          <Button variant="outline" size="sm" asChild className="rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50 text-xs font-bold px-3 py-1.5 h-auto">
            <Link href={`/reports/${report.id}`} className="flex items-center gap-1">
              Detalji <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}