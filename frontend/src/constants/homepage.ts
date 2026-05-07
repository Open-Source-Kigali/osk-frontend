// src/constants/homepage.ts
// ── All data that lives exclusively on the homepage

// ─── Hero
export const HERO_STATS = [
  { number: 100, label: "Contributors" },
  { number: 600, label: "Pull Requests" },
  { number: 300, label: "Projects" },
  { number: 200, label: "Active Memebers" },
];

// ─── About strip
export const ABOUT_STRIP_STATS = [
  { value: "100+", label: "Active Contributors" },
  { value: "10", label: "Projects Shipped" },
  { value: "600+", label: "Pull Requests Merged" },
];

// ─── Contribution roles
export type ContributionType =
  | "developer"
  | "designer"
  | "documentation"
  | "moderator";

export interface ContributionSlide {
  type: ContributionType;
  title: string;
  description: string;
}

export const CONTRIBUTION_SLIDES: ContributionSlide[] = [
  {
    type: "developer",
    title: "Developer or Tester",
    description:
      "Write and review code, fix bugs, add new features, and ensure projects run smoothly. Your contributions keep open-source projects alive and evolving.",
  },
  {
    type: "designer",
    title: "UI/UX Designer",
    description:
      "Create beautiful and user-friendly interfaces, design graphics, and improve the user experience for all community projects and gain a lot of experience.",
  },
  {
    type: "documentation",
    title: "Documentation",
    description:
      "Write clear guides, tutorials, and documentation or translate project materials so that everyone can understand and contribute easily and more efficiently.",
  },
  {
    type: "moderator",
    title: "Moderator",
    description:
      "Help grow and support the Community, guide new contributors, and promote projects through events, social media, and mentorship.",
  },
];

// ─── Explore section nav pills
export const EXPLORE_LINKS = [
  {
    label: "Connect with the Community",
    to: "/membersform",
    variant: "primary" as const,
  },
  {
    label: "Contribute to Projects",
    to: "/projects",
    variant: "secondary" as const,
  },
  {
    label: "Learn with the Community",
    to: "/resources",
    variant: "secondary" as const,
  },
];

// ─── Homepage events
export type HomeEventType = "hackathon" | "workshop" | "meetup" | "session";

export interface HomeEvent {
  id: number;
  type: HomeEventType;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tag: string;
}

export const HOME_EVENTS: HomeEvent[] = [
  {
    id: 1,
    type: "hackathon",
    title: "OSK Quarterly Hackathon — Build for Rwanda",
    date: "July 26–27, 2025",
    time: "8:00 AM – 6:00 PM",
    location: "Kigali Innovation City, Rwanda",
    description:
      "A 48-hour open source build challenge where teams tackle real societal problems. Open to all skill levels — developers, designers, and writers welcome.",
    tag: "Hackathon",
  },
  {
    id: 2,
    type: "workshop",
    title: "Git & GitHub for Beginners",
    date: "July 12, 2025",
    time: "10:00 AM – 1:00 PM",
    location: "Virtual (Discord)",
    description:
      "A hands-on workshop covering version control basics, making your first pull request, and navigating open-source contribution workflows.",
    tag: "Workshop",
  },
  {
    id: 3,
    type: "meetup",
    title: "Monthly Community Meetup — July Edition",
    date: "July 5, 2025",
    time: "3:00 PM – 5:30 PM",
    location: "Norrsken Kigali",
    description:
      "Connect with fellow contributors, showcase what you've built, and hear updates from project maintainers and the leadership team.",
    tag: "Meetup",
  },
  {
    id: 4,
    type: "session",
    title: "Weekly Technical Session — Code Review & Contributions",
    date: "Every Wednesday",
    time: "7:00 PM – 8:30 PM",
    location: "Virtual (Discord)",
    description:
      "Recurring coding session where contributors work on open issues, get code reviewed live, and receive mentorship from maintainers.",
    tag: "Weekly Session",
  },
];

// ─── Testimonials
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Amina Uwase",
    role: "Software Developer, Andela",
    initials: "AU",
    color: "#2b7fff",
    quote:
      "OSK gave me a clear path into open source. Within two months of joining, I had my first merged pull request on a real project. The mentorship here is unlike anything I found online.",
  },
  {
    id: 2,
    name: "Jean-Paul Hakizimana",
    role: "Computer Science Student, UR",
    initials: "JH",
    color: "#10b981",
    quote:
      "I came in knowing very little about collaboration. The weekly sessions and code reviews transformed how I think about software. OSK doesn't just teach you to code — it teaches you to build.",
  },
  {
    id: 3,
    name: "Clarisse Iradukunda",
    role: "UI/UX Designer",
    initials: "CI",
    color: "#8b5cf6",
    quote:
      "As a designer, I wasn't sure open source was for me. OSK changed that. My contributions have become my strongest portfolio pieces and led to a freelance opportunity.",
  },
  {
    id: 4,
    name: "Emile Nshimyimana",
    role: "Backend Engineer, Rwanda Coding Academy",
    initials: "EN",
    color: "#f59e0b",
    quote:
      "The hackathons OSK runs are top tier. You work on real problems, get real feedback, and build real connections. I met my current co-founder at an OSK event.",
  },
  {
    id: 5,
    name: "Solange Mukamana",
    role: "Technical Writer & Contributor",
    initials: "SM",
    color: "#f43f5e",
    quote:
      "OSK showed me that contribution isn't just about code. My documentation work has helped dozens of new contributors get started. It's incredibly fulfilling.",
  },
];

// ─── CTA activity feed
export type ActivityIconKey = "merge" | "join" | "pr" | "event";

export interface ActivityItem {
  id: number;
  iconKey: ActivityIconKey;
  iconBg: string;
  text: string;
  time: string;
}

export const CTA_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    iconKey: "merge",
    iconBg: "bg-green-500",
    text: "Amina merged PR #42 into EduTrack Rwanda",
    time: "2 min ago",
  },
  {
    id: 2,
    iconKey: "join",
    iconBg: "bg-blue-500",
    text: "Jean-Paul joined as a new contributor",
    time: "11 min ago",
  },
  {
    id: 3,
    iconKey: "pr",
    iconBg: "bg-purple-500",
    text: "Clarisse opened issue #17 on AfyaConnect",
    time: "34 min ago",
  },
  {
    id: 4,
    iconKey: "event",
    iconBg: "bg-yellow-500",
    text: "OSK Hackathon Q3 — registration is now open",
    time: "1 hr ago",
  },
  {
    id: 5,
    iconKey: "merge",
    iconBg: "bg-green-500",
    text: "Emile merged PR #38 into OpenRwanda Map",
    time: "2 hr ago",
  },
];

export const CTA_STATS = [
  { value: "100+", label: "Contributors" },
  { value: "600+", label: "Pull Requests" },
  { value: "10", label: "Active Projects" },
];

// ─── FAQ
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: "Do I need prior experience to join Open Source Kigali?",
    answer:
      "Not at all. OSK is open to everyone — from complete beginners to seasoned engineers. We have beginner-friendly issues labelled 'Good First Issue', structured onboarding, and mentors who will guide you through your first contribution step by step.",
  },
  {
    id: 2,
    question: "How is OSK different from just learning on YouTube or Udemy?",
    answer:
      "Passive learning gives you knowledge; OSK gives you experience. You'll work on real projects used by real people, collaborate with a team, get your code reviewed, and build a GitHub profile that shows employers what you can actually do — not just what courses you've completed.",
  },
  {
    id: 3,
    question:
      "I'm a designer or technical writer, not a developer. Is there a place for me?",
    answer:
      "Absolutely. Open source isn't only about code. We actively need UI/UX designers to improve interfaces, technical writers to write documentation and tutorials, and community moderators to keep things running smoothly. Every role contributes directly to project quality.",
  },
  {
    id: 4,
    question: "How much time do I need to commit each week?",
    answer:
      "There's no hard minimum. Even a few hours a week is enough to make meaningful contributions. We have weekly technical sessions (Wednesday evenings), monthly meetups, and quarterly hackathons — but you can participate at whatever pace works for your schedule.",
  },
  {
    id: 5,
    question: "What happens after I join? Where do I start?",
    answer:
      "Once you join, you'll be welcomed into our Discord/WhatsApp community, paired with an onboarding guide, and pointed toward beginner issues on GitHub. Our community manager and mentors will help you find the right project and make your first contribution within your first two weeks.",
  },
];
