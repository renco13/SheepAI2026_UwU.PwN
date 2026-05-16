import Link from "next/link";
import { ArrowRight, HandHeart, MapPinned, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features: Array<[LucideIcon, string, string]> = [
  [MapPinned, "Heat karta kvartova", "Odmah vidi gdje se gomilaju prijave."],
  [HandHeart, "Volontiraj", "Prijavi se na akciju i pojavi se kada je važno."],
  [ShieldCheck, "Admin kontrola", "Sustav ima ručni nadzor kad nešto zapne."],
  [Users, "Udruge uz odobrenje", "Organizacije se registriraju OIB-om i čekaju potvrdu."]
];

export default function HomePage() {
  return (
    <div className="space-y-10 pb-24">
      <section className="grid gap-8 rounded-[2rem] border bg-card p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="flex flex-col justify-center">
          <div className="mb-4 inline-flex w-fit rounded-full bg-secondary/30 px-3 py-1 text-sm font-semibold">Građani + udruge + kvartovi</div>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">SrediST probleme prije nego postanu svačiji problem.</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Prijavi problem u kvartu, podrži prijedlog glasom i priključi se zelenim akcijama koje Split čine urednijim, čišćim i povezanijim.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link href="/map">Otvori kartu <ArrowRight className="h-5 w-5" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/register">Registriraj se</Link></Button>
          </div>
        </div>
        <div className="grid gap-3">
          {features.map(([Icon, title, text]) => (
            <Card key={title} className="bg-background/65">
              <CardContent className="flex gap-3 p-4">
                <Icon className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><h2 className="text-2xl font-black">1. Prijavi</h2><p className="mt-2 text-muted-foreground">Klikni lokaciju na karti, dodaj opis, kategoriju i sliku.</p></CardContent></Card>
        <Card><CardContent className="p-5"><h2 className="text-2xl font-black">2. Podrži</h2><p className="mt-2 text-muted-foreground">Upvote/downvote čisti prioritete bez komentara i svađa.</p></CardContent></Card>
        <Card><CardContent className="p-5"><h2 className="text-2xl font-black">3. Sredi</h2><p className="mt-2 text-muted-foreground">Građani i udruge pretvaraju probleme u akcije volontiranja.</p></CardContent></Card>
      </section>
    </div>
  );
}
