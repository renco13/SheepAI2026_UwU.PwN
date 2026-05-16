import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { neighborhoods, reports, reportVotes, users, events, eventParticipants } from "../src/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const client = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(client);

type Polygon = { type: "Polygon"; coordinates: number[][][] };

function polygon(coords: [number, number][]): Polygon {
  return { type: "Polygon", coordinates: [[...coords, coords[0]]] };
}

const demoNeighborhoods = [
  { name: "Varoš", slug: "varos", geojson: polygon([[16.426, 43.512], [16.437, 43.515], [16.440, 43.509], [16.431, 43.505]]) },
  { name: "Meje", slug: "meje", geojson: polygon([[16.391, 43.510], [16.423, 43.515], [16.427, 43.503], [16.397, 43.496]]) },
  { name: "Spinut", slug: "spinut", geojson: polygon([[16.425, 43.527], [16.447, 43.526], [16.445, 43.515], [16.424, 43.515]]) },
  { name: "Bačvice", slug: "bacvice", geojson: polygon([[16.440, 43.508], [16.459, 43.507], [16.462, 43.499], [16.445, 43.497]]) },
  { name: "Split 3", slug: "split-3", geojson: polygon([[16.454, 43.515], [16.474, 43.515], [16.475, 43.506], [16.455, 43.505]]) },
  { name: "Mertojak", slug: "mertojak", geojson: polygon([[16.467, 43.508], [16.485, 43.508], [16.485, 43.498], [16.467, 43.498]]) },
  { name: "Pujanke", slug: "pujanke", geojson: polygon([[16.462, 43.527], [16.486, 43.527], [16.486, 43.516], [16.462, 43.516]]) },
  { name: "Žnjan", slug: "znjan", geojson: polygon([[16.479, 43.505], [16.502, 43.505], [16.506, 43.494], [16.481, 43.493]]) }
];

async function main() {
  await client.unsafe(`
    truncate table event_participants, events, report_votes, reports, neighborhoods, sessions, users restart identity cascade;
  `);

  const passwordHash = await bcrypt.hash("password123", 10);

  const [admin, citizen, citizen2, org, pendingOrg] = await db.insert(users).values([
    { email: "admin@sredist.local", passwordHash, displayName: "SrediST Admin", role: "admin", emailVerified: true },
    { email: "ana@sredist.local", passwordHash, displayName: "Ana iz kvarta", role: "citizen", emailVerified: true },
    { email: "mate@sredist.local", passwordHash, displayName: "Mate Volonter", role: "citizen", emailVerified: true },
    { email: "udruga@sredist.local", passwordHash, displayName: "Udruga Sunčani Split", role: "organization", organizationOib: "12345678901", organizationStatus: "approved", emailVerified: true },
    { email: "pending@sredist.local", passwordHash, displayName: "Udruga Na Čekanju", role: "organization", organizationOib: "10987654321", organizationStatus: "pending", emailVerified: true }
  ]).returning();

  const insertedNeighborhoods = await db.insert(neighborhoods).values(demoNeighborhoods).returning();
  const bySlug = Object.fromEntries(insertedNeighborhoods.map((n) => [n.slug, n]));

  const reportRows = await db.insert(reports).values([
    {
      title: "Divlji deponij iza parkirališta",
      description: "Već nekoliko tjedana se gomilaju vreće i stari namještaj iza parkirališta. Potrebna je akcija čišćenja i obavijest komunalnim službama.",
      category: "trash",
      status: "open",
      createdById: citizen.id,
      neighborhoodId: bySlug["split-3"].id,
      locationDescription: "Iza zgrade, kod velikog parkirališta",
      latitude: "43.5101000",
      longitude: "16.4631000",
      minPeopleNeeded: 6
    },
    {
      title: "Zapuštena zelena površina oko zgrade",
      description: "Stanari žele urediti travnjak, zasaditi par mediteranskih biljaka i dogovoriti tjedno održavanje.",
      category: "green_area",
      status: "accepted",
      createdById: citizen2.id,
      neighborhoodId: bySlug["mertojak"].id,
      locationDescription: "Mertojak, dvorište između dvije zgrade",
      latitude: "43.5034000",
      longitude: "16.4769000",
      minPeopleNeeded: 8
    },
    {
      title: "Smeće na plaži nakon vikenda",
      description: "Na dijelu plaže ostalo je puno ambalaže i sitnog otpada. Udruga može donijeti rukavice i vreće.",
      category: "beach",
      status: "open",
      createdById: org.id,
      neighborhoodId: bySlug["znjan"].id,
      locationDescription: "Žnjan, istočni dio plaže",
      latitude: "43.4989000",
      longitude: "16.4916000",
      minPeopleNeeded: 10
    },
    {
      title: "Opasna rupa na cesti",
      description: "Rupa se širi i auti je izbjegavaju naglim skretanjem. Ovo je za gradske službe, ne za volontere.",
      category: "road_damage",
      status: "in_review",
      createdById: citizen.id,
      neighborhoodId: bySlug["pujanke"].id,
      locationDescription: "Pujanke, blizu autobusne stanice",
      latitude: "43.5222000",
      longitude: "16.4745000",
      minPeopleNeeded: 5
    },
    {
      title: "Klupe u parku su oštećene",
      description: "Dvije klupe su oštećene i fale daske. Treba prijaviti službama ili organizirati sitan popravak ako bude dopušteno.",
      category: "public_equipment",
      status: "open",
      createdById: citizen2.id,
      neighborhoodId: bySlug["spinut"].id,
      locationDescription: "Mali park uz školu",
      latitude: "43.5201000",
      longitude: "16.4369000",
      minPeopleNeeded: 4
    },
    {
      title: "Čišćenje starog prolaza",
      description: "Prolaz je pun papira, boca i suhog lišća. Mala akcija od sat vremena bi riješila problem.",
      category: "trash",
      status: "open",
      createdById: citizen.id,
      neighborhoodId: bySlug["varos"].id,
      locationDescription: "Uski prolaz blizu stare jezgre",
      latitude: "43.5096000",
      longitude: "16.4337000",
      minPeopleNeeded: 3
    },
    {
      title: "Sadnja bilja kod ulaza u zgradu",
      description: "Stanari žele urediti mali plato lavandom, ružmarinom i par kamenih rubnika.",
      category: "green_area",
      status: "open",
      createdById: citizen2.id,
      neighborhoodId: bySlug["meje"].id,
      locationDescription: "Ulaz s južne strane zgrade",
      latitude: "43.5042000",
      longitude: "16.4126000",
      minPeopleNeeded: 5
    },
    {
      title: "Otpad uz plažni put",
      description: "Sitni otpad je razasut uz šetnicu. Dovoljna je mala volonterska grupa.",
      category: "beach",
      status: "open",
      createdById: org.id,
      neighborhoodId: bySlug["bacvice"].id,
      locationDescription: "Šetnica prema plaži",
      latitude: "43.5023000",
      longitude: "16.4490000",
      minPeopleNeeded: 7
    }
  ]).returning();

  const voteUsers = [admin, citizen, citizen2, org, pendingOrg];
  const votes = [];
  for (let i = 0; i < reportRows.length; i++) {
    const report = reportRows[i];
    const count = Math.min(voteUsers.length, 2 + (i % 4));
    for (let j = 0; j < count; j++) {
      votes.push({ reportId: report.id, userId: voteUsers[j].id, value: 1 });
    }
    if (i === 3) votes.push({ reportId: report.id, userId: voteUsers[4].id, value: 1 });
  }
  await db.insert(reportVotes).values(votes);

  const now = Date.now();
  const eventRows = await db.insert(events).values([
    {
      reportId: reportRows[2].id,
      organizerId: org.id,
      title: "Zelena akcija čišćenja Žnjana",
      description: "Okupljanje kod istočnog dijela plaže. Udruga donosi rukavice, vreće i osnovnu koordinaciju.",
      category: "beach",
      status: "published",
      locationText: "Žnjan, istočni dio plaže",
      latitude: "43.4989000",
      longitude: "16.4916000",
      startsAt: new Date(now + 2 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      maxParticipants: 30
    },
    {
      reportId: reportRows[1].id,
      organizerId: citizen2.id,
      title: "Uređenje zelenila na Mertojaku",
      description: "Stanari i susjedi uređuju zelenu površinu oko zgrade. Cilj je pokositi, očistiti i pripremiti malu sadnju.",
      category: "green_area",
      status: "published",
      locationText: "Mertojak, dvorište između zgrada",
      latitude: "43.5034000",
      longitude: "16.4769000",
      startsAt: new Date(now + 4 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxParticipants: 15
    },
    {
      reportId: null,
      organizerId: citizen.id,
      title: "Subotnja mini akcija u Varošu",
      description: "Neformalna kvartovska akcija čišćenja prolaza i skupljanja sitnog otpada.",
      category: "trash",
      status: "published",
      locationText: "Varoš, dogovor kod fontane",
      latitude: "43.5096000",
      longitude: "16.4337000",
      startsAt: new Date(now + 6 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxParticipants: 12
    }
  ]).returning();

  await db.insert(eventParticipants).values([
    { eventId: eventRows[0].id, userId: citizen.id, status: "joined" },
    { eventId: eventRows[0].id, userId: citizen2.id, status: "joined" },
    { eventId: eventRows[1].id, userId: citizen.id, status: "joined" },
    { eventId: eventRows[2].id, userId: org.id, status: "joined" }
  ]);

  console.log("Seed complete.");
  console.log("Admin: admin@sredist.local / password123");
  console.log("Citizen: ana@sredist.local / password123");
  console.log("Organization: udruga@sredist.local / password123");
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});
