import type { Partner } from "@/types";

// Partner logos — copy your uploaded images to src/assets/partners/

import digitalTransform  from '@/assets/partners/DTCR.png'
import giz               from '@/assets/partners/GIZ.png'
import millionCoders     from '@/assets/partners/RC.png'
import rwandaGovt        from '@/assets/partners/MINICT.png'

export const PARTNERS: Partner[] = [
 
  {
    id:          2,
    name:        "Digital Transformation Center Rwanda",
    shortName:   "DTC",
    category:    "company",
    description:
      "Rwanda's Digital Transformation Center drives the adoption of digital solutions across government and the private sector.",
    website:     "https://dtc.rw",
    logo:        digitalTransform,
    initials:    "DTC",
    bg:          "#1e1b6e",
    since:       "2025",
    collab:      "Digital infrastructure, government project collaboration",
    featured:    true,
  },
  {
    id:          3,
    name:        "GIZ German Cooperation",
    shortName:   "GIZ",
    category:    "company",
    description:
      "Deutsche Gesellschaft für Internationale Zusammenarbeit supports digital skills development across Africa.",
    website:     "https://giz.de",
    logo:        giz,
    initials:    "GIZ",
    bg:          "#cc0000",
    since:       "2025",
    collab:      "Funding support, international network, digital skills programs",
    featured:    false,
  },
  {
    id:          4,
    name:        "1 Million Rwandan Coders",
    shortName:   "1MRC",
    category:    "government",
    description:
      "A national initiative to train one million Rwandans in coding and digital skills.",
    website:     "https://1millioncoders.rw",
    logo:        millionCoders,
    initials:    "1M",
    bg:          "#1e3a8a",
    since:       "2024",
    collab:      "Shared learning curriculum, contributor pipeline, national reach",
    featured:    false,
  },
  {
    id:          5,
    name:        "Republic of Rwanda",
    shortName:   "GoR",
    category:    "government",
    description:
      "The Government of Rwanda supports OSK as part of its Smart Rwanda and Vision 2050 digital transformation agenda.",
    website:     "https://gov.rw",
    logo:        rwandaGovt,
    initials:    "GoR",
    bg:          "#166534",
    since:       "2025",
    collab:      "Official recognition, Smart Rwanda alignment, policy support",
    featured:    true,
  },
];

// Only partners that have a real logo image — used by the marquee
export const MARQUEE_PARTNERS = PARTNERS.filter((p) => Boolean(p.logo));

// Add these exports at the bottom of your existing src/constants/partners.ts

export const PARTNER_BENEFITS = [
  {
    iconKey:   "users",
    iconBg:    "bg-blue-100",
    iconColor: "text-blue-500",
    title:     "Talent pipeline",
    body:      "Get first access to pre-vetted contributors for internships, full-time roles, and freelance work.",
  },
  {
    iconKey:   "book",
    iconBg:    "bg-violet-100",
    iconColor: "text-violet-500",
    title:     "Co-brand education",
    body:      "Your engineers mentor our community. Your name appears on every workshop and resource you contribute to.",
  },
  {
    iconKey:   "globe",
    iconBg:    "bg-emerald-100",
    iconColor: "text-emerald-500",
    title:     "Community visibility",
    body:      "Logo placement on our site, social media, and at every event. Be part of Rwanda's open-source story.",
  },
  {
    iconKey:   "briefcase",
    iconBg:    "bg-orange-100",
    iconColor: "text-orange-500",
    title:     "Build real products",
    body:      "Bring a problem. We'll scope, build, and maintain an open-source tool together — you get the asset.",
  },
  {
    iconKey:   "building",
    iconBg:    "bg-rose-100",
    iconColor: "text-rose-500",
    title:     "Host our events",
    body:      "Companies that host hackathons and meetups get direct exposure to 100+ engaged developers.",
  },
  {
    iconKey:   "check",
    iconBg:    "bg-amber-100",
    iconColor: "text-amber-500",
    title:     "Shape the curriculum",
    body:      "University partners help co-design contribution tracks that map to real course outcomes.",
  },
];

export const PARTNERSHIP_STEPS = [
  {
    n:     "01",
    title: "Reach out",
    body:  "Send us an email — no formal proposal needed. Just tell us who you are and what you're thinking.",
  },
  {
    n:     "02",
    title: "We talk",
    body:  "A 30-minute call. We share what OSK does and what we need. No pitch — just an honest conversation.",
  },
  {
    n:     "03",
    title: "Agree on scope",
    body:  "A simple one-page MOU: what each party commits to, what they get, and how long it runs.",
  },
  {
    n:     "04",
    title: "Ship together",
    body:  "Your engineers join sessions, your students get onboarded, your space hosts events.",
  },
];

export const PARTNER_STATS = [
  {
    n:     "8+",
    label: "Partner organisations",
    sub:   "Universities, companies, NGOs, and government bodies",
  },
  {
    n:     "3",
    label: "University MOUs signed",
    sub:   "Formal agreements with Rwanda's leading institutions",
  },
  {
    n:     "40+",
    label: "Contributors from partners",
    sub:   "Students and engineers onboarded through partners",
  },
  {
    n:     "2",
    label: "Government-backed projects",
    sub:   "Civic-tech tools recognised at national level",
  },
];

export const WHAT_WE_LOOK_FOR = [
  "Genuine interest in Rwanda's developer ecosystem",
  "Willingness to commit time, not just logo placement",
  "Alignment with open source values — transparency, collaboration",
  "A specific thing you can offer: space, mentors, stipends, or hiring",
];