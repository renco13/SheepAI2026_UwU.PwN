// components/reports/vote-buttons.tsx
"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { voteReportAction } from "@/features/reports/actions";
import { Button } from "@/components/ui/button";

export function VoteButtons({ reportId, score, userVote }: { reportId: string; score: number; userVote: number | null }) {
  const upvote = voteReportAction.bind(null, reportId, 1);
  const downvote = voteReportAction.bind(null, reportId, -1);

  return (
    <div className="inline-flex items-center bg-emerald-50/50 border border-emerald-100/70 p-1.5 rounded-2xl gap-1 shadow-inner select-none">
      <form action={upvote}>
        <Button 
          type="submit" 
          variant={userVote === 1 ? "default" : "outline"} 
          size="icon" 
          aria-label="Podrži"
          className={`h-9 w-9 rounded-xl border-0 transition-all ${
            userVote === 1 
              ? "bg-emerald-500 text-white shadow-xs" 
              : "bg-white text-emerald-600 hover:bg-emerald-100/50"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="min-w-10 text-center text-sm font-black text-emerald-950">{score}</div>
      
      <form action={downvote}>
        <Button 
          type="submit" 
          variant={userVote === -1 ? "destructive" : "outline"} 
          size="icon" 
          aria-label="Ukloni/Protiv"
          className={`h-9 w-9 rounded-xl border-0 transition-all ${
            userVote === -1 
              ? "bg-red-500 text-white shadow-xs" 
              : "bg-white text-red-600 hover:bg-red-50"
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}