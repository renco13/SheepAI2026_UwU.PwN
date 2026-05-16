// app/login/page.tsx
import Link from "next/link";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-md pb-24 pt-4">
      <Card className="rounded-4xl shadow-xl shadow-emerald-950/5 border border-emerald-100/80 overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 mb-2">
              <span className="text-2xl">🌿</span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight">Sredit.ST Prijava</h1>
            <p className="mt-1 text-xs font-medium text-emerald-800/70">Prijavi se e-mailom i lozinkom za rad na problemima.</p>
          </div>
          
          {searchParams.error && (
            <p className="mb-4 rounded-2xl bg-red-50 border border-red-100 p-3.5 text-xs font-bold text-red-600 text-center">
              Neispravni podaci za prijavu. Molimo pokušajte ponovno.
            </p>
          )}

          <form action={loginAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-emerald-900 ml-1">E-mail adresa</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="ime.prezime@email.com" 
                className="w-full px-4 py-3.5 rounded-2xl border border-emerald-100 bg-white text-sm text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-auto"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-xs font-bold text-emerald-900">Lozinka</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3.5 rounded-2xl border border-emerald-100 bg-white text-sm text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-auto"
                required 
              />
            </div>
            
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-500/20 transition-all mt-6 h-auto">
              Prijavi se
            </Button>
          </form>
          
          <p className="mt-6 text-center text-xs text-emerald-900/60 font-medium">
            Nemate račun? <Link href="/register" className="text-emerald-600 font-bold hover:underline">Registrirajte se</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}