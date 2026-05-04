import type { OSKEvent, EventType, EventStatus, EventSpeaker, ApiEvent } from "@/types";
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
    mode:        e.mode,
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
    endDate:     e.endDate ?? undefined,
  };
}

export async function fetchEvents(): Promise<OSKEvent[]> {
  const data = await apiGet<ApiEvent[]>("/events");
  return data.map(transform);
}
