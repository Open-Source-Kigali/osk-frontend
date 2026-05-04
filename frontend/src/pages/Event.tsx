import { useState } from "react";
import { NavLink } from "react-router";
import {Calendar, Clock, MapPin, Users, ArrowUpRight, ChevronRight,Filter, Play, Mic, Zap,Code2, Globe, CheckCircle2,Bell, ChevronLeft} from "lucide-react";
import { useFilter, useEvents } from "@/hooks";
import { AttendeeBar, Badge , SectionLabel, Loader} from "@/components/UI";
import type {OSKEvent,EventType,} from "@/types";
import EyebrowLabel from "@/components/UI/EyebrowLable";



// ─── Meta maps 

const TYPE_META: Record<EventType, {
  label: string;
  icon:  React.ReactNode;
  bg:    string;
  text:  string;
  border:string;
}> = {
  hackathon: { label: "Hackathon",   icon: <Zap  size={12} />, bg: "bg-[#e8f1ff]",  text: "text-[#2b7fff]",   border: "border-[#c5d9ff]"  },
  workshop:  { label: "Workshop",    icon: <Code2 size={12} />, bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200"  },
  meetup:    { label: "Meetup",      icon: <Users size={12} />, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  session:   { label: "Tech Session",icon: <Mic   size={12} />, bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200"  },
  talk:      { label: "Talk",        icon: <Globe size={12} />, bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200"    },
};



const TYPE_FILTERS: { key: EventType | "all"; label: string }[] = [
  { key: "all",       label: "All events"  },
  { key: "hackathon", label: "Hackathons"  },
  { key: "workshop",  label: "Workshops"   },
  { key: "meetup",    label: "Meetups"     },
  { key: "session",   label: "Sessions"    },
  { key: "talk",      label: "Talks"       },
];

// ─── Sub-components 

const TypeBadge = ({ type }: { type: EventType }) => {
  const m = TYPE_META[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${m.bg} ${m.text} ${m.border}`}>
      {m.icon} {m.label}
    </span>
  );
};

const ModeBadge = ({ mode }: { mode: OSKEvent["mode"] }) => {
  const styles = {
    "in-person": "bg-[#e8f1ff] text-[#2b7fff] border-[#c5d9ff]",
    "virtual":   "bg-gray-100 text-gray-600 border-gray-200",
    "hybrid":    "bg-violet-50 text-violet-600 border-violet-200",
  };
  const labels = {
    "in-person": "In-person",
    "virtual":   "Virtual",
    "hybrid":    "Hybrid",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[mode]}`}>
      {mode === "virtual" ? <Globe size={10} /> : <MapPin size={10} />}
      {labels[mode]}
    </span>
  );
};

// ─── Mini Calendar 
const MiniCalendar = ({ events }: { events: OSKEvent[] }) => {
  const eventDays = events
    .filter((e) => e.month === "JUL" && e.status !== "past")
    .map((e) => e.day);

  const days   = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = 2; // July 2025 starts on Tuesday

  return (
    <div className="bg-white rounded-2xl border border-[#c5d9ff] p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          className="w-7 h-7 rounded-full border border-[#c5d9ff] flex items-center justify-center text-primary-colour hover:bg-[#e8f1ff] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <p className="text-sm font-black text-gray-900">July 2025</p>
        <button
          className="w-7 h-7 rounded-full border border-[#c5d9ff] flex items-center justify-center text-primary-colour hover:bg-[#e8f1ff] transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const hasEvent = eventDays.includes(day);
          const isToday  = day === 26;
          return (
            <div
              key={day}
              className="h-7 w-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold relative cursor-default transition-colors"
              style={
                isToday
                  ? { background: "#2b7fff", color: "#fff", fontWeight: 900 }
                  : hasEvent
                  ? { color: "#2b7fff", fontWeight: 800 }
                  : { color: "#9ca3af" }
              }
            >
              {day}
              {hasEvent && !isToday && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "#2b7fff" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 pt-4 flex items-center gap-4 text-xs text-gray-400 border-t"
        style={{ borderColor: "#e8f1ff" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "#2b7fff" }} />
          Event day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-200" />
          No events
        </span>
      </div>
    </div>
  );
};

// ─── Featured Event Card 

const FeaturedCard = ({ event }: { event: OSKEvent }) => (
  <div
    className="relative rounded-3xl overflow-hidden mb-8"
    style={{ background: "linear-gradient(135deg, #2b7fff 0%, #1a6fef 50%, #0a5fdf 100%)" }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    />
    <div
      className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
    />

    <div className="relative p-8 md:p-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

        {/* Left */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold">
              <Zap size={11} /> Featured Event
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#93bbff]" />
              {event.date}
            </span>
            <ModeBadge mode={event.mode} />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-3">
            {event.title}
          </h2>
          <p className="text-[#93bbff] font-semibold text-base mb-5">{event.tagline}</p>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xl mb-8">
            {event.description}
          </p>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: <Clock  size={15} />, label: "Time",      value: event.time     },
              { icon: <MapPin size={15} />, label: "Location",  value: event.location },
              { icon: <Users  size={15} />, label: "Registered",value: `${event.attendees} / ${event.capacity ?? "∞"}` },
            ].map((m) => (
              <div key={m.label} className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5 text-[#93bbff] text-xs mb-1">
                  {m.icon} {m.label}
                </div>
                <p className="text-white text-sm font-semibold leading-snug">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={event.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full text-sm font-black hover:bg-[#e8f1ff] transition-colors"
              style={{ color: "#2b7fff" }}
            >
              Register now <ArrowUpRight size={15} />
            </a>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 border border-white/30 text-white rounded-full text-sm font-semibold hover:bg-white/25 transition-colors">
              Learn more
            </button>
          </div>
        </div>

        {/* Right: speakers + fill bar */}
        <div className="shrink-0 w-full lg:w-64 flex flex-col gap-4">
          <div className="bg-white/10 rounded-2xl p-5 border border-white/15">
            <p className="text-[#93bbff] text-xs font-bold uppercase tracking-wider mb-4">
              Speakers
            </p>
            {event.speakers.map((s, i) => (
              <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-primary-colour text-xs font-black shrink-0"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  {s.initials}
                </div>
                <p className="text-white text-xs font-semibold">{s.name}</p>
              </div>
            ))}
          </div>

          {event.capacity && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
              <p className="text-[#93bbff] text-xs font-bold mb-3">
                {event.capacity - event.attendees} spots remaining
              </p>
              <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${Math.round((event.attendees / event.capacity) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-white/50 text-xs mt-1.5">
                {event.attendees} of {event.capacity} registered
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── Event Card 

const EventCard = ({ event }: { event: OSKEvent }) => {
  const isPast = event.status === "past";
  return (
    <div
      className={`bg-white rounded-2xl border-2 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group ${
        isPast ? "border-gray-100 opacity-80" : "border-[#c5d9ff] hover:border-[#5b9fff]"
      }`}
    >
      {/* Top color strip */}
      <div
        className="h-1 w-full"
        style={{
          background: isPast
            ? "#e5e7eb"
            : "linear-gradient(90deg, #2b7fff, #5b9fff)",
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Date box + badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${
              isPast ? "bg-gray-100" : "bg-[#e8f1ff]"
            }`}
          >
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isPast ? "text-gray-400" : "text-primary-colour"
              }`}
            >
              {event.month}
            </span>
            <span
              className={`text-2xl font-black leading-none ${
                isPast ? "text-gray-500" : "text-[#1a6fef]"
              }`}
            >
              {event.day}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <TypeBadge type={event.type} />
            <ModeBadge mode={event.mode} />
          </div>
        </div>

        {/* Content */}
        <h3
          className={`font-black text-base leading-snug mb-1 transition-colors duration-200 ${
            isPast
              ? "text-gray-600"
              : "text-gray-900 group-hover:text-primary-colour"
          }`}
        >
          {event.title}
        </h3>
        <p className="text-[#5b9fff] text-xs font-semibold mb-3">{event.tagline}</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{event.description}</p>

        {/* Info */}
        <div className="flex flex-col gap-1.5 mb-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock  size={11} style={{ color: "#5b9fff" }} /> {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: "#5b9fff" }} /> {event.location}
          </span>
        </div>

        {/* Attendee bar (upcoming with a capacity only) */}
        {!isPast && event.capacity && (
          <div className="mb-4">
            <AttendeeBar filled={event.attendees} capacity={event.capacity} />
          </div>
        )}

        {/* CTA */}
        {isPast ? (
          event.recapUrl || event.recordingUrl ? (
            <a
              href={event.recordingUrl ?? event.recapUrl}
              className="flex items-center gap-1.5 text-xs font-bold transition-colors"
              style={{ color: "#2b7fff" }}
            >
              <Play size={12} />
              {event.recordingUrl ? "Watch replay" : "Read recap"}
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic">No recording available</span>
          )
        ) : (
            <a
            href={event.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white text-center transition-colors block"
            style={{ background: "#2b7fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
          >
            Register →
          </a>
        )}
      </div>
    </div>
  );
};

// ─── Page 

const Event = () => {
  const [showPast, setShowPast] = useState(false);
  const { events, loading, error } = useEvents();

  const {
    filtered,
    filters,
    setFilter,
  } = useFilter<OSKEvent, { type: EventType | "all" }>({
    items:      events,
    searchKeys: ["title", "description", "tags"],
    filterKeys: ["type"],
  });

  const featured     = events.find((e) => e.featured) ?? events.find((e) => e.status !== "past");
  const upcoming     = filtered.filter((e) => e.status !== "past" && e.id !== featured?.id);
  const past         = events.filter((e) => e.status === "past");
  const upcomingCount = events.filter((e) => e.status !== "past").length;

  if (loading) {
    return <Loader fullPage />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-500">
        Failed to load events: {error}
      </div>
    );
  }

  return (
    <>
      {/* ── Hero */}
      <section
        className="pt-32 pb-16 px-6 md:px-20 relative overflow-hidden"
        style={{ background: "#f0f6ff" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(43,127,255,0.08) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-152 h-125 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(43,127,255,0.1) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">

            {/* Left */}
            <div className="max-w-2xl">
              <EyebrowLabel text="Events & Sessions" align="left"/>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-none tracking-tight mb-5">
                Where the
                <br />
                <span style={{ color: "#2b7fff" }}>community</span>
                <br />
                shows up.
              </h1>

              <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-lg">
                Weekly sessions, monthly meetups, and quarterly hackathons.
                Every event is open to all skill levels — and all of them are free.
              </p>
            </div>

            {/* Right: stats + mini calendar */}
            <div className="flex flex-col gap-4 shrink-0 w-full lg:w-72">
              {/* Stats — derived from EVENTS constant */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: upcomingCount,    label: "Upcoming"  },
                  { n: events.length,    label: "This year" },
                  { n: "100+",           label: "Per event" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl p-4 text-center border"
                    style={{ background: "#e8f1ff", borderColor: "#c5d9ff" }}
                  >
                    <p className="text-xl font-black" style={{ color: "#2b7fff" }}>{s.n}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <MiniCalendar events={events} />
            </div>
          </div>

          {/* Type filter tabs */}
          <div
            className="flex gap-2 flex-wrap p-1.5 rounded-2xl border w-fit"
            style={{ background: "#e8f1ff", borderColor: "#c5d9ff" }}
          >
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter("type", f.key)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:cursor-pointer"
                style={
                  filters.type === f.key
                    ? { background: "#2b7fff", color: "#fff" }
                    : { color: "#5b9fff", background: "transparent" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured event */}
      <section className="px-6 md:px-20 py-10 bg-white mt-6">
        <div className="max-w-7xl mx-auto">
          <EyebrowLabel text="Next big event" align="left"/>
          {featured && <FeaturedCard event={featured} />}
        </div>
      </section>

      {/* ── Upcoming events */}
      <section className="px-6 md:px-20 py-12" style={{ background: "#f0f6ff" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <EyebrowLabel text="Coming up" align="left"/>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Upcoming events
              </h2>
            </div>
            <NavLink
              to="/community"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs md:text-base font-bold"
              style={{ color: "#2b7fff" }}
            >
              See schedule <ChevronRight size={13} />
            </NavLink>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Calendar size={36} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-gray-500">No events match this filter.</p>
              <button
                onClick={() => setFilter("type", "all")}
                className="mt-4 px-5 py-2 rounded-full border text-sm font-semibold"
                style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Notify strip */}
      <section
        className="px-6 md:px-20 py-10 border-y"
        style={{ background: "#e8f1ff", borderColor: "#c5d9ff" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#2b7fff" }}
            >
              <Bell size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-base mb-0.5">
                Never miss an event.
              </p>
              <p className="text-gray-500 text-sm">
                Get notified on Discord and WhatsApp before every session, meetup, and hackathon.
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              className="px-5 py-2.5 rounded-full text-white text-sm font-bold transition-colors hover:cursor-pointer"
              style={{ background: "#2b7fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
            >
              Join Discord
            </button>
            <button
              className="px-5 py-2.5 rounded-full text-sm font-bold border transition-colors hover:cursor-pointer"
              style={{ borderColor: "#2b7fff", color: "#2b7fff" }}
            >
              WhatsApp group
            </button>
          </div>
        </div>
      </section>

      {/* ── Past events  */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <SectionLabel color="#9ca3af">Archive</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Past events
              </h2>
            </div>
            <button
              onClick={() => setShowPast((p) => !p)}
              className="inline-flex items-center gap-1.5 text-sm md:text-base font-bold"
              style={{ color: "#2b7fff" }}
            >
              <Filter size={12} />
              {showPast ? "Show less" : "Show all"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showPast ? past : past.slice(0, 3)).map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Propose an event */}
      <section
        className="px-6 md:px-20 py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2b7fff 0%, #0a5fdf 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="live" dot className="mb-6">
              Open to proposals
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
              Have an idea for
              <br />
              an OSK event?
            </h2>
            <p className="text-[#93bbff] text-base leading-relaxed mb-8">
              We run 50+ events a year. Many of the best ones were proposed by
              community members — not the leadership team.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Code2 size={15} />, label: "Technical workshops" },
                { icon: <Mic   size={15} />, label: "Guest speaker talks"  },
                { icon: <Users size={15} />, label: "Community meetups"    },
                { icon: <Zap   size={15} />, label: "Themed hackathons"    },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5"
                >
                  <span className="text-[#93bbff]">{item.icon}</span>
                  <span className="text-white text-xs font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proposal card */}
          <div className="bg-white rounded-2xl p-7">
            <h3 className="text-lg font-black text-gray-900 mb-2">Submit a proposal</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              No formal process. Send us a few lines about your idea and we'll take it from there.
            </p>

            <div className="space-y-2.5 mb-6">
              {[
                "A topic or theme you want to teach or explore",
                "Whether you'd run it or want help facilitating",
                "Virtual, in-person, or either",
                "Your rough availability",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle2
                    size={15}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#2b7fff" }}
                  />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
                <a
                href="mailto:opensourcekigali@gmail.com?subject=Event Proposal"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-bold transition-colors"
                style={{ background: "#2b7fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
              >
                Send proposal <ArrowUpRight size={14} />
              </a>
              <NavLink
                to="/community"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-sm font-semibold transition-colors"
                style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
              >
                Or suggest it in Discord
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Event;