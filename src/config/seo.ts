export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

export const DEFAULT_SEO = {
  siteName: "Open Source Kigali",
  defaultTitle: "Open Source Kigali | Empowering Rwanda's Tech Innovators",
  titleTemplate: "%s | Open Source Kigali",
  defaultDescription:
    "Open Source Kigali is Rwanda's premier developer community fostering open-source collaboration, skill advancement, and impactful tech solutions across Africa.",
  siteUrl: "https://oskigali.org",
  defaultImage: "/og-image.jpeg",
  twitterHandle: "@OS_kigali",
  defaultKeywords: [
    "Open Source Kigali",
    "OSK",
    "Rwanda Tech",
    "Open Source Rwanda",
    "Kigali Developers",
    "African Tech Community",
    "Software Engineering Kigali",
    "Tech Events Rwanda",
    "Kigali Hackathons",
    "Developer Meetups",
  ],
};

export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: "Open Source Kigali | Empowering Rwanda's Tech Innovators",
    description:
      "Join Open Source Kigali, Rwanda's premier community of open-source builders, contributors, and tech innovators. Discover projects, join events, and collaborate.",
    keywords: [
      "Open Source Kigali",
      "Rwanda developers",
      "open source community",
      "tech innovations",
      "learn to code Kigali",
      "software development Rwanda",
    ],
    type: "website",
  },
  about: {
    title: "About Us",
    description:
      "Discover Open Source Kigali's mission, story, core values, and community leadership shaping Rwanda into a hub of open-source engineering excellence.",
    keywords: [
      "About Open Source Kigali",
      "OSK mission",
      "OSK leadership",
      "open source story Rwanda",
      "tech mentorship Kigali",
    ],
    type: "website",
  },
  community: {
    title: "Community & Channels",
    description:
      "Connect with passionate Rwandan software developers, designers, and mentors across Discord, WhatsApp, GitHub, and Twitter. Join our vibrant community.",
    keywords: [
      "OSK community channels",
      "Rwanda developer Discord",
      "Kigali WhatsApp developers",
      "tech community Kigali",
      "mentorship Rwanda",
    ],
    type: "website",
  },
  events: {
    title: "Events & Sessions",
    description:
      "Explore upcoming hackathons, weekly tech sessions, hands-on workshops, and community meetups hosted by Open Source Kigali. Free and open to all.",
    keywords: [
      "Kigali tech events",
      "Rwanda hackathons",
      "developer workshops Kigali",
      "coding sessions",
      "tech talks Rwanda",
    ],
    type: "website",
  },
  projects: {
    title: "Projects",
    description:
      "Explore open-source software built by the Open Source Kigali community. Find good first issues, contribute code, and build real-world software together.",
    keywords: [
      "open source projects Rwanda",
      "good first issues",
      "GitHub repositories Kigali",
      "contribute to open source",
      "developer collaboration",
    ],
    type: "website",
  },
  partners: {
    title: "Partners & Sponsors",
    description:
      "Partner with Open Source Kigali to support local tech talent, sponsor hackathons, and accelerate open-source innovation across Rwanda and Africa.",
    keywords: [
      "OSK partners",
      "tech sponsors Rwanda",
      "corporate sponsorship Kigali",
      "partner with Open Source Kigali",
      "developer empowerment",
    ],
    type: "website",
  },
  partnersForm: {
    title: "Become a Partner",
    description:
      "Partner with Open Source Kigali. Submit your partnership proposal to sponsor workshops, support student developers, and co-build impactful tech programs.",
    keywords: [
      "partner with OSK",
      "sponsorship inquiry",
      "collaborate Open Source Kigali",
      "tech sponsor form",
    ],
    type: "website",
  },
  donate: {
    title: "Support the Mission",
    description:
      "Help keep open source alive in Rwanda. Your contribution directly funds developer workshops, cloud infrastructure, and tools for students and contributors.",
    keywords: [
      "donate to Open Source Kigali",
      "support Rwanda developers",
      "sponsor tech community",
      "open source funding",
    ],
    type: "website",
  },
  notFound: {
    title: "Page Not Found",
    description:
      "The page you're looking for doesn't exist or has moved. Explore Open Source Kigali's projects, events, and community channels.",
    noindex: true,
  },
};

/**
 * Format a page title consistently with the brand suffix.
 */
export function formatTitle(title?: string): string {
  if (!title) {
    return DEFAULT_SEO.defaultTitle;
  }
  if (title.includes(DEFAULT_SEO.siteName)) {
    return title;
  }
  return DEFAULT_SEO.titleTemplate.replace("%s", title);
}
