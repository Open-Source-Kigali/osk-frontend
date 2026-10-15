export type EventStatus = "upcoming" | "live" | "past";
export type EventType   = "hackathon" | "workshop" | "meetup" | "session" | "talk";
export type EventMode   = "in-person" | "virtual" | "hybrid";

export interface EventSpeaker {
  name:     string;
  role:     string;
  initials: string;
}

export interface OSKEvent {
  id:           string | number;
  startDate?:   string;
  endDate?:     string;
  slug:         string;
  type:         EventType;
  status:       EventStatus;
  mode:         EventMode | null;
  title:        string;
  tagline:      string;
  description:  string;
  date:         string;
  dateShort:    string;
  day:          number;
  month:        string;
  year:         number;
  time:         string;
  location:     string;
  attendees:    number;
  capacity:     number | null;
  speakers:     EventSpeaker[];
  tags:         string[];
  featured:     boolean;
  registerUrl:  string;
  recapUrl?:    string;
  recordingUrl?:string;
  coverImage?:  string;
}