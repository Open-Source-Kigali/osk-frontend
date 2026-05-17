import type { NavLink } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Community", path: "/community" },
  { name: "Events", path: "/event" },
  // { name: "Resources", path: "/resources" },
  { name: "Projects", path: "/projects" },
  { name: "Partners", path: "/partners" },
];

export const FOOTER_LINKS: Record<string, NavLink[]> = {
  Community: [
    { name: "About OSK", path: "/about" },
    { name: "Community Charter", path: "/about#charter" },
    { name: "Our Team", path: "/about#team" },
    { name: "Partners", path: "/partners" },
  ],
  Contribute: [
    { name: "All Projects", path: "/projects" },
    { name: "Good First Issues", path: "/projects#issues" },
    // { name: "Contribution Guide", path: "/resources" },
    { name: "Mentorship", path: "/community" },
  ],
  Resources: [
    // { name: "Tutorials", path: "/resources?type=tutorial" },
    // { name: "Blog", path: "/resources?type=article" },
    { name: "Events", path: "/events" },
    { name: "Opportunities", path: "/community" },
  ],
  Connect: [
    {
      name: "GitHub",
      path: "https://github.com/opensourcekigali",
      external: true,
    },
    {
      name: "Discord",
      path: "https://discord.com/invite/3dTFZSn6Tq",
      external: true,
    },
    { name: "LinkedIn", path: "https://linkedin.com", external: true },
    {
      name: "Email",
      path: "mailto:opensourcekigali@gmail.com",
      external: true,
    },
  ],
};
