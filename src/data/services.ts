import { siteConfig } from "../../siteConfig";

export type ServiceId = "accommodation" | "dining" | "drinks" | "events" | "pool" | "spa" | "outdoor" | "other";

/** Themes group questions across services for the analytics page (e.g. every cleanliness question). */
export type Theme = "cleanliness" | "staff" | "food" | "service" | "value" | "comfort" | "ambience" | "facilities" | "overall";

export interface Question {
  /** Stable key, stored with each review. Never rename a key once real reviews exist. */
  key: string;
  label: string;
  theme: Theme;
}

export interface Service {
  id: ServiceId;
  label: string;
  short: string;
  blurb: string;
  icon: string; // lucide icon name, mapped in components/ServiceIcon.tsx
  image: string;
  questions: Question[];
}

export const services: Service[] = [
  {
    id: "accommodation",
    label: "Accommodation / Overnight Stay",
    short: "Rooms",
    blurb: "Ten rooms with private bathrooms, free Wi-Fi and flat-screen TVs (confirm).",
    icon: "BedDouble",
    image: "room-windows.jpg",
    questions: [
      { key: "room_cleanliness", label: "Room cleanliness", theme: "cleanliness" },
      { key: "bed_comfort", label: "Bed comfort", theme: "comfort" },
      { key: "bathroom_cleanliness", label: "Bathroom cleanliness", theme: "cleanliness" },
      { key: "room_atmosphere", label: "Room atmosphere", theme: "ambience" },
      { key: "room_staff", label: "Staff friendliness", theme: "staff" },
      { key: "room_value", label: "Value for money", theme: "value" },
    ],
  },
  {
    id: "dining",
    label: "Restaurant / Dining",
    short: "Dining",
    blurb: "Breakfast, Kenyan favourites, grills, curries and weekend sharing platters.",
    icon: "UtensilsCrossed",
    image: "nyama-chapati.jpg",
    questions: [
      { key: "food_quality", label: "Food quality", theme: "food" },
      { key: "food_presentation", label: "Food presentation", theme: "food" },
      { key: "taste_freshness", label: "Taste and freshness", theme: "food" },
      { key: "menu_variety", label: "Menu variety", theme: "food" },
      { key: "dining_speed", label: "Service speed", theme: "service" },
      { key: "dining_staff", label: "Staff friendliness", theme: "staff" },
      { key: "dining_cleanliness", label: "Cleanliness", theme: "cleanliness" },
    ],
  },
  {
    id: "drinks",
    label: "Drinks & Beverages",
    short: "Drinks",
    blurb: "Masala chai, coffee, fresh juice and cold sodas.",
    icon: "CupSoda",
    image: "juice.jpg",
    questions: [
      { key: "drinks_quality", label: "Drinks quality", theme: "food" },
      { key: "drinks_variety", label: "Drink variety", theme: "food" },
      { key: "drinks_atmosphere", label: "Atmosphere", theme: "ambience" },
      { key: "drinks_service", label: "Service", theme: "service" },
      { key: "drinks_pricing", label: "Pricing", theme: "value" },
    ],
  },
  {
    id: "events",
    label: "Events / Conferences",
    short: "Events",
    blurb: "Meetings, celebrations and group gatherings.",
    icon: "PartyPopper",
    image: "patio.jpg",
    questions: [
      { key: "venue_setup", label: "Venue setup", theme: "facilities" },
      { key: "events_cleanliness", label: "Cleanliness", theme: "cleanliness" },
      { key: "events_staff", label: "Staff support", theme: "staff" },
      { key: "events_facilities", label: "Facilities", theme: "facilities" },
      { key: "events_organisation", label: "Overall organisation", theme: "service" },
    ],
  },
  {
    id: "pool",
    label: "Swimming Pool",
    short: "Pool",
    blurb: "Pool and sun loungers.",
    icon: "Waves",
    image: "waterside.jpg",
    questions: [
      { key: "pool_cleanliness", label: "Cleanliness", theme: "cleanliness" },
      { key: "water_quality", label: "Water quality", theme: "facilities" },
      { key: "pool_facilities", label: "Facilities", theme: "facilities" },
      { key: "pool_safety", label: "Safety", theme: "facilities" },
      { key: "pool_overall", label: "Overall experience", theme: "overall" },
    ],
  },
  {
    id: "spa",
    label: "Spa / Wellness",
    short: "Spa",
    blurb: "Treatments and relaxation.",
    icon: "Flower2",
    image: "waterside.jpg",
    questions: [
      { key: "treatment_quality", label: "Treatment quality", theme: "service" },
      { key: "spa_professionalism", label: "Professionalism", theme: "staff" },
      { key: "spa_cleanliness", label: "Cleanliness", theme: "cleanliness" },
      { key: "relaxation", label: "Relaxation experience", theme: "ambience" },
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor Activities",
    short: "Outdoors",
    blurb: "Lake trips, walks and excursions around Naivasha.",
    icon: "Mountain",
    image: "naivasha-hippos.jpg",
    questions: [
      { key: "activity_enjoyment", label: "Enjoyment of the activity", theme: "overall" },
      { key: "activity_guide", label: "Guide or host", theme: "staff" },
      { key: "activity_safety", label: "Safety", theme: "facilities" },
      { key: "activity_value", label: "Value for money", theme: "value" },
    ],
  },
  {
    id: "other",
    label: "Other Services",
    short: "Other",
    blurb: "Reception, parking, Wi-Fi, luggage storage or simply passing by.",
    icon: "Sparkles",
    image: "patio.jpg",
    questions: [],
  },
];

/** Asked of every guest, whatever they selected. */
export const generalQuestions: Question[] = [
  { key: "customer_service", label: "Customer service", theme: "service" },
  { key: "general_value", label: "Value for money", theme: "value" },
  { key: "ambience", label: "Ambience", theme: "ambience" },
  { key: "overall_satisfaction", label: "Overall satisfaction", theme: "overall" },
];

export const offeredServices = services.filter((s) => siteConfig.offered[s.id]);
export const serviceById = Object.fromEntries(services.map((s) => [s.id, s])) as Record<ServiceId, Service>;

export const allQuestions: (Question & { service: ServiceId | "general" })[] = [
  ...services.flatMap((s) => s.questions.map((q) => ({ ...q, service: s.id }))),
  ...generalQuestions.map((q) => ({ ...q, service: "general" as const })),
];
export const questionByKey = Object.fromEntries(allQuestions.map((q) => [q.key, q]));

export const themeLabels: Record<Theme, string> = {
  cleanliness: "Cleanliness",
  staff: "Staff performance",
  food: "Food & drink quality",
  service: "Service delivery",
  value: "Value for money",
  comfort: "Comfort",
  ambience: "Ambience",
  facilities: "Facilities",
  overall: "Overall",
};

/**
 * QR locations. Each prints as its own code linking to /review/<slug>, which preselects `service`.
 * Locations whose service is not offered are hidden automatically.
 */
export interface QrLocation {
  slug: string;
  label: string;
  hint: string;
  service: ServiceId | null;
}

export const qrLocations: QrLocation[] = ([
  { slug: "reception", label: "Reception", hint: "Front desk", service: null },
  { slug: "rooms", label: "Guest Rooms", hint: "Bedside or back of the door", service: "accommodation" },
  { slug: "restaurant", label: "Restaurant Tables", hint: "Table tent or menu card", service: "dining" },
  { slug: "drinks", label: "Drinks Counter", hint: "Counter or juice bar", service: "drinks" },
  { slug: "pool", label: "Swimming Pool", hint: "Pool deck", service: "pool" },
  { slug: "events", label: "Conference Rooms", hint: "Meeting room door", service: "events" },
  { slug: "spa", label: "Spa", hint: "Treatment room", service: "spa" },
  { slug: "outdoors", label: "Outdoor Activities", hint: "Activity desk", service: "outdoor" },
] as QrLocation[]).filter((l) => l.service === null || siteConfig.offered[l.service]);

/** Extra aliases accepted at /review/<slug>. */
export const slugAliases: Record<string, string> = { room: "rooms", dining: "restaurant", bar: "drinks", conference: "events" };
