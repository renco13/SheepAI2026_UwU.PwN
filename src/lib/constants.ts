export const REPORT_CATEGORIES = {
  trash: "Smeće / divlji deponij",
  green_area: "Zapuštena zelena površina",
  beach: "Plaža / obala",
  road_damage: "Rupa na cesti",
  public_equipment: "Javna oprema",
  other: "Ostalo"
} as const;

export const EVENT_CATEGORIES = REPORT_CATEGORIES;

export const REPORT_STATUSES = {
  open: "Otvoreno",
  in_review: "U pregledu",
  accepted: "Prihvaćeno",
  converted_to_event: "Pretvoreno u akciju",
  forwarded_to_city: "Proslijeđeno gradskim službama",
  resolved: "Riješeno",
  rejected: "Odbijeno"
} as const;

export const EVENT_STATUSES = {
  draft: "Skica",
  published: "Objavljeno",
  rescheduled: "Promijenjen termin",
  completed: "Završeno",
  cancelled: "Otkazano"
} as const;

export const USER_ROLES = {
  citizen: "Građanin",
  organization: "Udruga",
  admin: "Admin"
} as const;

export const ORGANIZATION_STATUSES = {
  pending: "Čeka odobrenje",
  approved: "Odobreno",
  rejected: "Odbijeno"
} as const;

export const SPLIT_CENTER = { lng: 16.4402, lat: 43.5081 };
