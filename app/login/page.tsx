import Link from "next/link";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-md pb-24">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-black">Prijava</h1>
          <p className="mt-1 text-sm text-muted-foreground">Prijavi se emailom i lozinkom.</p>
          {searchParams.error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Neispravni podaci za prijavu.</p>}
          <form action={loginAction} className="mt-6 space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
            <div className="space-y-2"><Label htmlFor="password">Lozinka</Label><Input id="password" name="password" type="password" required /></div>
            <Button type="submit" className="w-full">Prijavi se</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">Nemaš račun? <Link className="font-semibold text-primary" href="/register">Registriraj se</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
