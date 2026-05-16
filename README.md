 SrediST

SrediST is a community civic platform built for the city of Split, Croatia. It gives citizens and local organisations a simple tool to report neighbourhood problems, gather community support, and organise volunteer cleanup events — all on an interactive map of the city.

The name "SrediST" is a Croatian wordplay meaning roughly "fix it / sort it out", combined with "ST" — the abbreviation for Split.

---

 What it does

Citizens can open the app, see a live map of Split divided into neighbourhoods, and immediately understand where problems are concentrated. Each neighbourhood is colour-coded by the number of active reports — the more reports, the more attention it needs.

From there, the flow is simple:

1. Report a problem — tap the map to drop a pin, describe the issue, pick a category, and optionally attach a photo
2. Vote on reports — upvote problems you care about, downvote ones you think aren't valid
3. Turn reports into events — when a report gains enough community support, it can become a volunteer cleanup event
4. Volunteer — join an event and show up to help fix the problem
5. Forward to the city — admins can escalate infrastructure problems directly to city services

---

 Who uses it

Citizens (`citizen`) — regular residents of Split. They can report problems, vote, and join volunteer events.

Organisations (`organization`) — local NGOs and civic groups. They register with their OIB (Croatian business ID) and get approved by an admin. They can organise events and take a more active role.

Admins (`admin`) — manage the platform, approve organisations, change report statuses, and forward relevant problems to city services.

---

 Report categories

- `trash` — illegal dumping / waste
- `green_area` — neglected parks or green spaces
- `beach` — beach and coastal issues
- `road_damage` — potholes and road damage
- `public_equipment` — broken benches, lights, signs
- `other` — anything else

---

 Tech stack

- Next.js (App Router) — framework
- TypeScript — language
- Tailwind CSS — styling
- MapLibre GL JS — interactive map
- Supabase (local Postgres) — database
- Drizzle ORM — database queries
- bcrypt — password hashing
- Custom session auth — email/password with httpOnly cookie sessions

---

 Getting started

 Prerequisites

- Node.js 20+
- npm
- Docker
- Supabase CLI

 Setup

```bash
cp .env.example .env.local
npm install
npm run supabase:start
npm run db:migrate
npm run db:seed
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

---

 Demo accounts

The seed script creates these accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sredist.local | password123 |
| Citizen | ana@sredist.local | password123 |
| Approved organisation | udruga@sredist.local | password123 |
| Pending organisation | pending@sredist.local | password123 |

---

 Environment variables

Copy `.env.example` to `.env.local` — the defaults work out of the box for local development:

```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
SESSION_SECRET="replace-this-with-a-long-random-secret-for-local-demo"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MAP_STYLE_URL="https://demotiles.maplibre.org/style.json"
```

---

 Project structure

```
src/app               Next.js routes and pages
src/components        UI components, map, cards, forms
src/db                Drizzle schema and database connection
src/features          Server actions organised by domain
src/lib               Auth, session, constants, helpers
src/types             Shared TypeScript types
supabase/migrations   SQL migrations for local Supabase
scripts/seed.ts       Demo data for development and pitching
```

---

 Map

The map uses MapLibre GL JS with demo neighbourhoods of Split defined as GeoJSON:

- Bačvice, Žnjan, Mertojak, Split 3, Pujanke, Spinut, Varoš, Meje

Clicking a marker opens report details. Clicking anywhere on the map fills in the coordinates when creating a new report.

> Note: The project currently uses the public MapLibre demo tile style. 

---

 Image uploads

For the hackathon demo, images are stored locally at:

```
public/uploads/reports
```

This is intentionally simple. Production would use object storage such as Supabase Storage or S3.

---

 Database

Useful commands:

```bash
npm run supabase:start    # start local Supabase
npm run supabase:stop     # stop local Supabase
npm run supabase:reset    # reset and reapply all migrations
npm run db:generate       # generate a new Drizzle migration
npm run db:migrate        # apply pending migrations
npm run db:seed           # seed demo data
```

---

 Future improvements

- Email verification and password reset
- Real email notifications when reports are forwarded to city services
- Production object storage for images
- Public organisation profiles
- Real-time updates via Supabase Realtime
- Native mobile app
