import { NavLink } from "react-router";

import { Github, Twitter, Linkedin, MessageCircle, Mail } from "lucide-react";



interface FooterLinkGroup {
  heading: string;
  links: { label: string; to: string; external?: boolean }[];
}

const linkGroups: FooterLinkGroup[] = [
  {
    heading: "Community",
    links: [
      { label: "About OSK", to: "/about" },
      { label: "Community Charter", to: "/charter" },
      { label: "Our Team", to: "/team" },
      { label: "Partners", to: "/partners" },
    ],
  },
  {
    heading: "Contribute",
    links: [
      { label: "All Projects", to: "/projects" },
      { label: "Good First Issues", to: "/issues" },
      { label: "Contribution Guide", to: "/guide" },
      { label: "Mentorship", to: "/mentorship" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Tutorials", to: "/resources" },
      { label: "Blog", to: "/blog" },
      { label: "Events", to: "/events" },
      { label: "Opportunities", to: "/opportunities" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "GitHub", to: "https://github.com/Open-Source-Kigali", external: true },
      { label: "Discord", to: "https://discord.com", external: true },
      { label: "LinkedIn", to: "https://www.linkedin.com/company/open-source-kigali/?viewAsMember=true", external: true },
      {
        label: "opensourcekigali@gmail.com",
        to: "mailto:opensourcekigali@gmail.com",
        external: true,
      },
    ],
  },
];

const socialLinks = [
  { icon: <Github size={18} />, href: "https://github.com", label: "GitHub" },
  { icon: <Twitter size={18} />, href: "https://twitter.com", label: "Twitter / X" },
  { icon: <Linkedin size={18} />, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: <MessageCircle size={18} />, href: "https://discord.com", label: "Discord" },
  { icon: <Mail size={18} />, href: "mailto:opensourcekigali@gmail.com", label: "Email" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 md:px-20 py-16">
        {/* Top Row: Brand + Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand */}
          <div className="md:col-span-1">
            <NavLink to="/" className="inline-block mb-4">
              <span className="text-white font-bold text-lg tracking-tight">
                Open Source <span className="text-blue-400">Kigali</span>
              </span>
            </NavLink>
            <p className="text-sm leading-relaxed text-gray-500">
              Building Rwanda's open source ecosystem — one contribution at a time.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {linkGroups.map((group) => (
            <div key={group.heading} className="md:col-span-1">
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
                {group.heading}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-white transition-colors duration-200 break-all"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <NavLink
                        to={link.to}
                        className="text-sm hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {currentYear} Open Source Kigali. All rights reserved.</p>
          <div className="flex gap-5">
            <NavLink to="/privacy" className="hover:text-gray-400 transition">
              Privacy Policy
            </NavLink>
            <NavLink to="/conduct" className="hover:text-gray-400 transition">
              Code of Conduct
            </NavLink>
            <NavLink to="/charter" className="hover:text-gray-400 transition">
              Community Charter
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
