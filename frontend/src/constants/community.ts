export const COMMUNITY_STATS = [
  { value: "100+", label: "Members",       sub: "and growing"        },
  { value: "52",   label: "Sessions held", sub: "every Wednesday"    },
  { value: "600+", label: "Pull requests", sub: "merged on GitHub"   },
  { value: "10",   label: "Live projects", sub: "open to contribute" },
];

export const CHANNELS = [
  { name: "general",          emoji: "💬", desc: "Day-to-day talk, intros, memes, everything.",                  members: 98, active: true  },
  { name: "code-review",      emoji: "🔍", desc: "Post your PRs. Get honest, helpful feedback.",                 members: 74, active: true  },
  { name: "good-first-issues",emoji: "🟢", desc: "Curated issues for people just getting started.",              members: 61, active: false },
  { name: "opportunities",    emoji: "📌", desc: "Jobs, internships, grants, and collabs shared here first.",    members: 89, active: true  },
  { name: "project-updates",  emoji: "📦", desc: "Maintainers post progress. Contributors stay in the loop.",   members: 55, active: false },
  { name: "design-collab",    emoji: "🎨", desc: "Figma links, UI feedback, design systems discussions.",        members: 42, active: false },
  { name: "events",           emoji: "📅", desc: "Hackathons, meetups, workshops — everything calendar-worthy.", members: 77, active: true  },
  { name: "off-topic",        emoji: "☕", desc: "Because not everything has to be about code.",                 members: 93, active: false },
];

export const GUIDELINES = [
  { rule: "Respect everyone, always. Experience level is not a ranking."                     },
  { rule: "Ask dumb questions. There are no dumb questions in #general."                     },
  { rule: "Give feedback on code, not people. Be direct, not unkind."                        },
  { rule: "Share opportunities. If it's good for you, share it — someone else needs it too." },
  { rule: "Show up. You don't have to be perfect, but you have to be present."               },
  { rule: "Violations of safety or respect get you removed. No negotiation."                 },
];

// Social platforms — icon is injected in the component to keep this file JSX-free
export const SOCIAL_PLATFORMS = [
  {
    name:   "Discord",
    handle: "OSK Community",
    desc:   "Main hub for daily chat, sessions, and support",
    color:  "bg-indigo-500",
    link:   "#",
    cta:    "Join Server",
    iconKey:"discord",
  },
  {
    name:   "GitHub",
    handle: "opensourcekigali",
    desc:   "All projects, issues, and pull requests live here",
    color:  "bg-gray-900",
    link:   "https://github.com/Open-Source-Kigali",
    cta:    "View Org",
    iconKey:"github",
  },
  {
    name:   "LinkedIn",
    handle: "Open Source Kigali",
    desc:   "Professional updates, member features, and opportunities",
    color:  "bg-blue-600",
    link:   "https://www.linkedin.com/company/open-source-kigali/?viewAsMember=true",
    cta:    "Follow",
    iconKey:"linkedin",
  },
  {
    name:   "X / Twitter",
    handle: "@OSKigali",
    desc:   "Quick updates, event announcements, and thread drops",
    color:  "bg-gray-800",
    link:   "https://x.com/OS_kigali",
    cta:    "Follow",
    iconKey:"twitter",
  },
];