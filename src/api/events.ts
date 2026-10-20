import type { OSKEvent, EventType, EventStatus, EventMode, EventSpeaker, ApiEvent } from "@/types";
import { formatDateRange, slugFromTitle } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import { apiGet } from "./client";

function deriveType(category: string): EventType {
  const c = category.toLowerCase();
  if (c.includes("hackathon")) return "hackathon";
  if (c.includes("workshop"))  return "workshop";
  if (c.includes("meetup"))    return "meetup";
  if (c.includes("session"))   return "session";
  if (c.includes("talk"))      return "talk";
  return "session";
}

function deriveStatus(date: string, endDate: string | null): EventStatus {
  const now   = Date.now();
  const start = new Date(date).getTime();
  const end   = endDate ? new Date(endDate).getTime() : start;
  if (now > end + 24 * 60 * 60 * 1000) return "past";
  if (now >= start && now <= end)      return "live";
  return "upcoming";
}

const MODE_ALIASES: Record<string, EventMode> = {
  "in-person": "in-person",
  "in person": "in-person",
  "in_person": "in-person",
  inperson:    "in-person",
  onsite:      "in-person",
  "on-site":   "in-person",
  physical:    "in-person",
  virtual:     "virtual",
  online:      "virtual",
  remote:      "virtual",
  hybrid:      "hybrid",
};

// The API may send values outside EventMode (e.g. "online"); map known
// aliases and return null for anything unrecognised so the UI can skip it.
export function normalizeMode(mode: string | null | undefined): EventMode | null {
  if (!mode) return null;
  return MODE_ALIASES[mode.trim().toLowerCase()] ?? null;
}

function toSpeakers(speakers: string[] | null): EventSpeaker[] {
  if (!speakers) return [];
  return speakers.map((name) => ({ name, role: "", initials: getInitials(name) }));
}

function transform(e: ApiEvent): OSKEvent {
  const start = new Date(e.date);
  const end   = e.endDate ? new Date(e.endDate) : null;
  const fmt   = formatDateRange(start, end);

  return {
    id:          e.id,
    slug:        slugFromTitle(e.title, e.id),
    type:        deriveType(e.category),
    status:      deriveStatus(e.date, e.endDate),
    mode:        normalizeMode(e.mode),
    title:       e.title,
    tagline:     e.tagline ?? "",
    description: e.description ?? "",
    date:        fmt.date,
    dateShort:   fmt.dateShort,
    day:         fmt.day,
    month:       fmt.month,
    year:        fmt.year,
    time:        e.timeLabel ?? "",
    location:    e.location ?? "",
    attendees:   e.registered,
    capacity:    e.capacity,
    speakers:    toSpeakers(e.speakers),
    tags:        [e.category],
    featured:    e.featured,
    registerUrl: e.registerUrl ?? "#",
    coverImage:  e.imageUrl ?? undefined,
    startDate:   e.date,
    endDate:     e.endDate ?? undefined,
  };
}

export async function fetchEvents(): Promise<OSKEvent[]> {
  const data = await apiGet<ApiEvent[]>("/events");
  return data.map(transform);
}
