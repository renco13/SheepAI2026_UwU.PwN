import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["citizen", "organization", "admin"]);
export const organizationStatusEnum = pgEnum("organization_status", ["pending", "approved", "rejected"]);
export const reportCategoryEnum = pgEnum("report_category", [
  "trash",
  "green_area",
  "beach",
  "road_damage",
  "public_equipment",
  "other"
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "in_review",
  "accepted",
  "converted_to_event",
  "forwarded_to_city",
  "resolved",
  "rejected"
]);
export const eventStatusEnum = pgEnum("event_status", ["draft", "published", "rescheduled", "completed", "cancelled"]);
export const participantStatusEnum = pgEnum("participant_status", ["joined", "cancelled", "attended"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: userRoleEnum("role").notNull().default("citizen"),
  organizationOib: text("organization_oib"),
  organizationStatus: organizationStatusEnum("organization_status"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId)
}));

export const neighborhoods = pgTable("neighborhoods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  geojson: jsonb("geojson").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: reportCategoryEnum("category").notNull(),
  status: reportStatusEnum("status").notNull().default("open"),
  createdById: uuid("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id, { onDelete: "set null" }),
  locationDescription: text("location_description"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  imageUrl: text("image_url"),
  minPeopleNeeded: integer("min_people_needed").notNull().default(5),
  voteScore: integer("vote_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  statusIdx: index("reports_status_idx").on(table.status),
  neighborhoodIdx: index("reports_neighborhood_id_idx").on(table.neighborhoodId),
  categoryIdx: index("reports_category_idx").on(table.category)
}));

export const reportVotes = pgTable("report_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  reportUserUnique: uniqueIndex("report_votes_report_user_unique").on(table.reportId, table.userId),
  reportIdx: index("report_votes_report_id_idx").on(table.reportId),
  userIdx: index("report_votes_user_id_idx").on(table.userId)
}));

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id, { onDelete: "set null" }),
  organizerId: uuid("organizer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: reportCategoryEnum("category").notNull(),
  status: eventStatusEnum("status").notNull().default("published"),
  locationText: text("location_text").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  organizerIdx: index("events_organizer_id_idx").on(table.organizerId),
  statusIdx: index("events_status_idx").on(table.status)
}));

export const eventParticipants = pgTable("event_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: participantStatusEnum("status").notNull().default("joined"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
  eventUserUnique: uniqueIndex("event_participants_event_user_unique").on(table.eventId, table.userId),
  eventIdx: index("event_participants_event_id_idx").on(table.eventId),
  userIdx: index("event_participants_user_id_idx").on(table.userId)
}));

export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
  events: many(events),
  votes: many(reportVotes),
  participations: many(eventParticipants)
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  creator: one(users, { fields: [reports.createdById], references: [users.id] }),
  neighborhood: one(neighborhoods, { fields: [reports.neighborhoodId], references: [neighborhoods.id] }),
  votes: many(reportVotes),
  events: many(events)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  report: one(reports, { fields: [events.reportId], references: [reports.id] }),
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  participants: many(eventParticipants)
}));

export const neighborhoodsRelations = relations(neighborhoods, ({ many }) => ({
  reports: many(reports)
}));

export const reportVotesRelations = relations(reportVotes, ({ one }) => ({
  report: one(reports, { fields: [reportVotes.reportId], references: [reports.id] }),
  user: one(users, { fields: [reportVotes.userId], references: [users.id] })
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, { fields: [eventParticipants.eventId], references: [events.id] }),
  user: one(users, { fields: [eventParticipants.userId], references: [users.id] })
}));
