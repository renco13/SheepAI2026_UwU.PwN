// app/register/page.tsx
import Link from "next/link";
import { registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const errors: Record<string, string> = {
  invalid: "Provjeri podatke. Lozinka mora imati barem 8 znakova.",
  exists: "Račun s tim emailom već postoji.",
  oib: "Organizacija mora unijeti valjani OIB od 11 znamenki."
};

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-lg pb-24 pt-4">
      <Card className="rounded-4xl shadow-xl shadow-emerald-950/5 border border-emerald-100/80 overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 mb-2">
              <span className="text-2xl">🌱</span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight">Stvori novi račun</h1>
            <p className="mt-1 text-xs font-medium text-emerald-800/70">Građani odmah koriste sustav. Udruge prolaze provjeru.</p>
          </div>

          {searchParams.error && (
            <p className="mb-4 rounded-2xl bg-red-50 border border-red-100 p-3.5 text-xs font-bold text-red-600 text-center">
              {errors[searchParams.error] ?? errors.invalid}
            </p>
          )}

          <form action={registerAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-xs font-bold text-emerald-900 ml-1">Ime / Naziv</Label>
              <Input id="displayName" name="displayName" placeholder="Npr. Ante Antić ili Udruga Zeleni" className="w-full px-4 py-3 rounded-2xl border border-emerald-100 h-auto text-sm" required />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-emerald-900 ml-1">E-mail adresa</Label>
              <Input id="email" name="email" type="email" placeholder="ime@primjer.com" className="w-full px-4 py-3 rounded-2xl border border-emerald-100 h-auto text-sm" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-emerald-900 ml-1">Lozinka (min. 8 znakova)</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} className="w-full px-4 py-3 rounded-2xl border border-emerald-100 h-auto text-sm" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="accountType" className="text-xs font-bold text-emerald-900 ml-1">Tip računa</Label>
                <Select id="accountType" name="accountType" defaultValue="citizen" className="w-full rounded-2xl border border-emerald-100 bg-white text-sm h-11">
                  <option value="citizen">Građanin</option>
                  <option value="organization">Udruga / Organizacija</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="organizationOib" className="text-xs font-bold text-emerald-900 ml-1">OIB organizacije</Label>
                <Input id="organizationOib" name="organizationOib" inputMode="numeric" placeholder="Samo za udruge" className="w-full px-4 py-3 rounded-2xl border border-emerald-100 h-auto text-sm" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-500/20 transition-all mt-6 h-auto">
              Kreiraj račun
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-emerald-900/60 font-medium">
            Već imate račun? <Link href="/login" className="text-emerald-600 font-bold hover:underline">Prijavite se</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}