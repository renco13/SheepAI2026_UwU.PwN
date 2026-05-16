// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-4xl border border-emerald-100 bg-white p-8 text-center shadow-xl shadow-emerald-950/5 mt-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 mb-4 shadow-inner">
        <span className="text-3xl">🔍</span>
      </div>
      <h1 className="text-2xl font-black text-emerald-950 tracking-tight">Stranica nije pronađena</h1>
      <p className="mt-2 text-sm font-medium text-emerald-800/70 leading-relaxed">
        Traženi sadržaj, komunalni problem ili volonterska akcija ne postoji, premještena je ili je uklonjena iz sustava.
      </p>
      <Button asChild className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all shadow-md shadow-emerald-500/10 h-auto">
        <Link href="/map">Natrag na kartu</Link>
      </Button>
    </div>
  );
}