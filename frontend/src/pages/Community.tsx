import { NavLink } from "react-router";
import {
  Github,
  MessageCircle,
  Linkedin,
  Twitter,
  ArrowUpRight,
  Hash,
  Users,
  Shield,
} from "lucide-react";
import {
  COMMUNITY_STATS,
  CHANNELS,
  GUIDELINES,
  SOCIAL_PLATFORMS,
} from "@/constants";
import EyebrowLabel from "@/components/UI/EyebrowLable";
import PrimaryButton from "@/components/UI/PrimaryButton";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  discord: <MessageCircle size={22} />,
  github: <Github size={22} />,
  linkedin: <Linkedin size={22} />,
  twitter: <Twitter size={22} />,
};

// ─── Sub-components

// ─── Page
const Community = () => (
  <>
    {/* HERO */}
    <section className="pt-32 pb-20 px-6 md:px-20 bg-[#FFFBF7] relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          {/* Left copy */}
          <div className="max-w-2xl">
            <EyebrowLabel
              text="Community is live "
              className=" animate-pulse"
              align="left"
            />

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-none tracking-tight mb-6">
              This is where
              <br />
              <span className="text-blue-500">builders</span> come
              <br />
              to find{" "}
              <span className="relative inline-block">
                <span>their people.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 6 C40 2, 80 7, 120 4 C160 1, 190 6, 198 5"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-lg">
              OSK is not a Slack channel you forget about. It's a weekly rhythm
              of sessions, PRs, and real conversations between people trying to
              build things that matter in Rwanda.
            </p>
          </div>

          {/* Right: stats — from COMMUNITY_STATS constant */}
          <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
            {COMMUNITY_STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <p className="text-3xl font-black text-gray-900 leading-none mb-1">
                  {s.value}
                </p>
                <p className="text-gray-800 text-sm font-semibold">{s.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Avatar stack + CTA */}
        <div className="mt-16 flex items-center flex-wrap gap-3">
          <div className="flex -space-x-2">
            {(["DD", "AU", "JH", "CI", "EN"] as const).map((ini, i) => (
              <div
                key={ini}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: [
                    "#3b82f6",
                    "#10b981",
                    "#8b5cf6",
                    "#f59e0b",
                    "#ef4444",
                  ][i],
                  zIndex: 5 - i,
                }}
              >
                {ini}
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">100+ people</span>{" "}
            already building — come meet them.
          </p>
          <PrimaryButton to="" className="">
            Join the Community Now <ArrowUpRight size={14} />
          </PrimaryButton>
        </div>
      </div>
    </section>

    {/* WHERE WE HANG */}
    <section className="py-24 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <EyebrowLabel text="The Channels" align="left" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Where the real talk happens.
            </h2>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-sm md:text-right leading-relaxed">
            We use Discord and WhatsApp. These are the channels you'll actually
            use every day.
          </p>
        </div>

        {/* Channel grid — from CHANNELS constant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CHANNELS.map((ch) => (
            <div
              key={ch.name}
              className="group rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{ch.emoji}</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Hash size={13} className="text-gray-400 shrink-0" />
                  <span className="font-mono text-base font-semibold text-gray-900 truncate">
                    {ch.name}
                  </span>
                </div>
                {ch.active && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 animate-pulse"
                    title="Active now"
                  />
                )}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {ch.desc}
              </p>
              <div className="flex items-center gap-1 text-gray-400">
                <Users size={14} />
                <span className="text-xs">{ch.members}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Social platforms — from SOCIAL_PLATFORMS constant */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SOCIAL_PLATFORMS.map((p) => (
            <a
              key={p.name}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-300"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform ${p.color}`}
              >
                {SOCIAL_ICONS[p.iconKey]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-base">
                    {p.name}
                  </p>
                  <ArrowUpRight
                    size={14}
                    className="text-gray-400 group-hover:text-gray-700 transition-colors"
                  />
                </div>
                <p className="text-gray-400 text-sm font-mono truncate mb-1">
                  {p.handle}
                </p>
                <p className="text-gray-400 text-xs leading-snug">{p.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>

    {/* ── 3. COMMUNITY GUIDELINES */}
    <section className="py-24 px-6 md:px-20 bg-gray-950">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div>
          <EyebrowLabel text="How we treat each other" align="left" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            Six rules.
            <br />
            <span className="text-gray-500">No fine print.</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            OSK is only as good as the people in it. These aren't policies
            written by a lawyer — they're the norms that have made this
            community a place people actually want to spend time.
          </p>
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-blue-400 shrink-0" />
            <p className="text-gray-500 text-sm">
              Violations are handled by the moderation team. Repeat offences
              result in removal.
            </p>
          </div>
        </div>

        {/* Right: rules — from GUIDELINES constant */}
        <div className="space-y-3">
          {GUIDELINES.map((g, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:bg-white/8 transition-colors duration-200"
            >
              <span className="text-gray-600 font-mono text-sm shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-gray-300 text-sm leading-relaxed">{g.rule}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 4. BOTTOM CTA*/}
    <section className="py-24 px-6 md:px-20 bg-[#FFFBF7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <EyebrowLabel text="You Have Made It This Far" align="center" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
            the Community tab won't close itself.
          </h2>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            You've read enough. The next step isn't another page — it's joining
            the Discord, saying hi in #general, and finding your first issue.
            Takes 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          <NavLink
            to="/contact"
            className="group flex flex-col items-start p-7 bg-blue-500 hover:bg-blue-400 rounded-2xl text-white transition-colors duration-200"
          >
            <MessageCircle size={28} className="mb-4" />
            <p className="font-black text-xl mb-1">Join Discord</p>
            <p className="text-blue-100 text-sm mb-6 leading-snug">
              Where the sessions happen and the Community lives.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all">
              Open server <ArrowUpRight size={14} />
            </span>
          </NavLink>

          <NavLink
            to="/projects"
            className="group flex flex-col items-start p-7 bg-gray-950 hover:bg-gray-800 rounded-2xl text-white transition-colors duration-200"
          >
            <Github size={28} className="mb-4" />
            <p className="font-black text-xl mb-1">Browse Projects</p>
            <p className="text-gray-400 text-sm mb-6 leading-snug">
              10 live repos. Find one that fits your skills.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all text-gray-300">
              View GitHub <ArrowUpRight size={14} />
            </span>
          </NavLink>
        </div>
      </div>
    </section>
  </>
);

export default Community;
