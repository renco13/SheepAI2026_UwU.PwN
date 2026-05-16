# SrediST

**SrediST** je lokalni hackathon MVP za građanske prijave problema, zelene akcije i društveno volontiranje u Splitu.

Stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style lokalne UI komponente
- MapLibre GL JS
- Supabase local Postgres
- Drizzle ORM
- Custom email/password auth sa session cookiejem
- Lokalni upload slika za demo

## Brzi start

Preduvjeti:

- Node.js 20+
- npm
- Docker
- Supabase CLI

```bash
cp .env.example .env.local
npm install
npm run supabase:start
npm run db:migrate
npm run db:seed
npm run dev
```

Otvori:

```txt
http://localhost:3000
```

## Demo korisnici

Seed skripta stvara ove račune:

```txt
Admin:
email: admin@sredist.local
password: password123

Građanin:
email: ana@sredist.local
password: password123

Udruga odobrena:
email: udruga@sredist.local
password: password123

Udruga na čekanju:
email: pending@sredist.local
password: password123
```

## Supabase lokalna baza

Default lokalni Supabase Postgres connection string:

```txt
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Ako Supabase CLI vrati drugačije portove, promijeni `DATABASE_URL` u `.env.local`.

## Glavni demo flow za 3-minutni pitch

1. Otvori kartu Splita.
2. Prikaži kvartove obojane po broju prijava.
3. Klikni prijavu i pokaži glasanje.
4. Kao građanin kreiraj novu prijavu.
5. Iz prijave napravi akciju ili pokaži postojeću akciju.
6. Klikni `Volontiraj`.
7. Kao admin otvori panel i označi problem kao proslijeđen gradskim službama.

## Napomena o map tiles

Projekt koristi public MapLibre demo style iz `.env.local`:

```txt
NEXT_PUBLIC_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json
```

Za produkciju treba koristiti legalno i stabilno rješenje za tileove, npr. MapTiler, Stadia Maps, vlastiti tile server ili drugi provjereni provider.

## Slike

Za hackathon se slike spremaju lokalno u:

```txt
public/uploads/reports
```

To je namjerno jednostavno rješenje za lokalni demo, ne produkcijski storage.

## Struktura

```txt
src/app                 Next.js rute
src/components          UI, mapa, kartice, forme
src/db                  Drizzle schema i konekcija
src/features            Server akcije po domeni
src/lib                 auth, session, constants, helpers
src/types               zajednički tipovi
supabase/migrations     SQL migracije za lokalni Supabase
scripts/seed.ts         demo podaci
```
