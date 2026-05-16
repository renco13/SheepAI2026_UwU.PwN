# AGENT.md — SrediST

## Projekt

SrediST je lokalni hackathon MVP za Split. Aplikacija omogućuje građanima i udrugama prijavu problema, glasanje, organizaciju zelenih akcija i osnovnu prioritizaciju problema po kvartovima.

Cilj nije napraviti društvenu mrežu, nego jednostavan civilni alat:

- prijavi problem,
- prikupi podršku,
- pretvori problem u akciju,
- volontiraj,
- proslijedi gradski relevantne probleme prema službama.

## Dogovoreni stack

Koristi:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-style lokalne UI komponente
- MapLibre GL JS
- Supabase local Postgres
- Drizzle ORM
- Custom auth sa session cookiejem
- Lokalni upload slika za hackathon demo

Ne uvoditi za prvu verziju:

- komentare,
- javne profile,
- društvenu mrežu,
- kompleksne organizacije s članovima,
- realtime sync,
- native mobile aplikaciju,
- produkcijski object storage.

## Jezik i UX

Aplikacija je na hrvatskom jeziku.

Ton i vizualni stil:

- community app,
- toplo zeleno,
- moderno,
- mediteranski karakter,
- inspiracija: Split i Mediteranske igre 1979 bez direktnog kopiranja službenih znakova.

Mobile-first je prioritet.

Desktop layout može biti jači za demo, ali sve mora raditi i na mobitelu.

## Role

Role u prvoj verziji:

- `citizen` — građanin,
- `organization` — udruga / organizacija,
- `admin` — developer/admin koji ručno odobrava i popravlja sustav.

Registracija:

- običan korisnik postaje `citizen`,
- organizacija se registrira s OIB-om,
- organizacija dobiva status `pending`,
- admin je mora odobriti u admin panelu.

U prvoj verziji organizacija je samo poseban korisnički račun. Ne raditi `organization_members` tablicu i ne raditi javne profile.

## Auth

Koristi custom auth:

- email/password,
- bcrypt password hash,
- session token u httpOnly cookieju,
- sessions tablica u bazi.

Email potvrda i reset lozinke nisu obavezni za hackathon demo. Mogu se navesti kao buduća nadogradnja.

## Prijave problema

Kategorije:

- `trash` — smeće / divlji deponij,
- `green_area` — zapuštena zelena površina,
- `beach` — plaža / obala,
- `road_damage` — rupa na cesti,
- `public_equipment` — javna oprema,
- `other` — ostalo.

Statusi:

- `open`,
- `in_review`,
- `accepted`,
- `converted_to_event`,
- `forwarded_to_city`,
- `resolved`,
- `rejected`.

Prijava ima:

- naslov,
- opis,
- kategoriju,
- lokaciju klikom na kartu,
- dodatni tekstualni opis lokacije,
- opcionalnu sliku,
- minimalni broj potrebnih ljudi koji određuje kreator prijave.

Glasanje:

- upvote/downvote,
- jedan korisnik ima samo jedan aktivan glas po prijavi,
- korisnik može promijeniti ili maknuti glas.

Pragovi:

- `min_people_needed + 5` = istaknuto,
- `min_people_needed + 10` = jak call to action,
- gradske službe se bave prijavama koje su u njihovoj nadležnosti, posebno infrastruktura.

## Akcije

Akcija može nastati iz prijave ili samostalno.

Svaki građanin može predložiti akciju.

Polja akcije:

- naslov,
- opis,
- kategorija,
- lokacija,
- datum i vrijeme početka,
- datum i vrijeme kraja,
- organizator,
- maksimalan broj sudionika opcionalno,
- status.

Statusi akcije:

- `draft`,
- `published`,
- `rescheduled`,
- `completed`,
- `cancelled`.

Termin za prijavu korisnika na akciju u UI-u je **Volontiraj**.

Organizator može promijeniti datum akcije i dodati detalje kroz opis/status.

## Admin panel

Admin panel ostaje jednostavan.

Admin može:

- vidjeti najglasovanije prijave,
- vidjeti prijave po kategoriji,
- vidjeti prijave koje su prešle prag,
- odobriti organizaciju,
- promijeniti status prijave,
- označiti prijavu kao proslijeđenu gradskim službama.

Za MVP se ne šalje stvarni email. UI može pokazati status kao da je obavijest poslana.

## Karta

Koristi MapLibre GL JS.

Prva verzija koristi demo kvartove u GeoJSON obliku:

- Bačvice,
- Žnjan,
- Mertojak,
- Split 3,
- Pujanke,
- Spinut,
- Varoš,
- Meje.

Karta treba prikazati:

- kvartove obojane po broju aktivnih prijava,
- markere prijava,
- klik na marker otvara detalje,
- klik na kartu puni lat/lng u formi za prijavu.

GPS `koristi moju lokaciju` može biti demo pomoćni gumb, ali glavni tok je klik na kartu.

## Kodni standardi

Preferiraj jednostavan, čitljiv kod.

Ne uvoditi kompleksne apstrakcije bez potrebe.

Kad dodaješ novu funkcionalnost:

1. dodaj tipove,
2. dodaj server akciju/API,
3. dodaj UI komponentu,
4. dodaj seed/demo podatke ako pomažu pitchu,
5. provjeri da mobile layout ostaje upotrebljiv.

Ako je izbor između produkcijski savršenog rješenja i hackathon funkcionalnog rješenja, biraj hackathon funkcionalno rješenje, ali ostavi jasan komentar gdje je kompromis.

## Demo cilj

Pitch traje 3 minute.

Demo treba pokazati:

1. kartu Splita,
2. problematične kvartove,
3. prijavu problema,
4. glasanje,
5. akciju volontiranja,
6. admin ručno prosljeđivanje problema.
