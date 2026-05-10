
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaFacebookF, FaGithub, FaFigma } from "react-icons/fa6";

import { ABOUT_STATS, STORY_POINTS, VALUES, ABOUT_TEAM } from "@/constants";
import peopleImg from "@/assets/images/People.jpeg";
import groupImg from "@/assets/images/did.jpeg.jpeg";
import EyebrowLabel from "@/components/UI/EyebrowLable";
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";


//Types
interface DotProps {
  color: string;
  size: string;
  style?: React.CSSProperties;
}

//Sub-components

// Purely decorative floating blob — no logic, no state
const Dot = ({ color, size, style }: DotProps) => (
  <div
    className={`absolute rounded-full ${color} ${size}`}
    style={{ opacity: 0.85, ...style }}
  />
);

// Reusable pill badge used in every section header

//Page
const About = () => (
  <div className="font-sans">
    {/* ── HERO */}
    <section className="relative bg-white overflow-hidden pt-16 pb-0">
      {/* Floating decorative dots */}
      <Dot
        color="bg-blue-500"
        size="w-3 h-3"
        style={{ top: "18%", left: "8%" }}
      />
      <Dot
        color="bg-green-400"
        size="w-2.5 h-2.5"
        style={{ top: "30%", left: "40%" }}
      />
      <Dot
        color="bg-yellow-400"
        size="w-4 h-4"
        style={{ top: "55%", right: "22%" }}
      />
      <Dot
        color="bg-blue-400"
        size="w-2 h-2"
        style={{ top: "65%", left: "55%" }}
      />
      <Dot
        color="bg-pink-400"
        size="w-3 h-3"
        style={{ top: "80%", right: "38%" }}
      />
      <Dot
        color="bg-purple-400"
        size="w-2 h-2"
        style={{ top: "20%", right: "30%" }}
      />

      <div className="max-w-5xl mx-auto px-6 md:px-20 text-center relative z-10 py-16">
        <EyebrowLabel text="About Open Source Kigali" align="center" />

        <h1 className="text-2xl md:text-5xl font-black text-gray-900 leading-tight mb-8 mt-3">
          We're building the open
          <br />
          source movement in Rwanda.
        </h1>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center mt-6 mb-14">
          <PrimaryButton to="/membersform" className="w-full md:w-auto">
            Join the Community
          </PrimaryButton>
          <SecondaryButton to="/projects" className="w-full  md:w-auto">
            View Projects
          </SecondaryButton>
        </div>

        <div className="w-full">
          <img
            src={peopleImg}
            alt="OSK team collaboration"
            className="w-full rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Stats strip — data from ABOUT_STATS constant */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-20 flex flex-wrap items-center justify-center gap-10 py-4">
          {ABOUT_STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3 text-center">
              <span className="font-black text-primary-colour text-3xl md:text-4xl">
                {s.value}
              </span>
              <span className="text-gray-500 text-base uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* OUR STORY  */}
    <section className="py-24 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div className="relative">
          <Dot
            color="bg-blue-500"
            size="w-2.5 h-2.5"
            style={{ top: "10%", left: "-16px" }}
          />
          <Dot
            color="bg-pink-400"
            size="w-4 h-4"
            style={{ bottom: "20%", right: "10%" }}
          />

          <EyebrowLabel text="Our Story" align="left" />

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">
            We're building the economic infrastructure for open source in
            Rwanda.
          </h2>

          <div className="flex items-start gap-4 mt-8">
            <div className="w-12 h-12 shrink-0 rounded-full border-4 border-blue-500 border-r-transparent border-b-transparent rotate-45 mt-1" />
            <p className="text-gray-500 text-base leading-relaxed">
              A living place for curiosity and collaboration, meeting and
              meaning. The heart of a community where developers ship real
              things together.
            </p>
          </div>
        </div>

        {/* Right — numbered story points from constant */}
        <div className="flex flex-col divide-y divide-gray-100">
          {STORY_POINTS.map((sp) => (
            <div key={sp.number} className="py-6 first:pt-0 last:pb-0">
              <div className="flex gap-4">
                <span className="text-blue-500 font-black text-base w-8 shrink-0">
                  {sp.number}.
                </span>
                <div>
                  <p className="font-bold text-gray-900 text-xl mb-1">
                    {sp.title}
                  </p>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    {sp.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── OUR VISION  */}
    <section className="py-24 px-6 md:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: image */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src={groupImg}
            alt="Community collaboration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: vision text */}
        <div className="relative">
          <Dot
            color="bg-yellow-400"
            size="w-4 h-4"
            style={{ top: "-12px", right: "20%" }}
          />
          <Dot
            color="bg-pink-400"
            size="w-3 h-3"
            style={{ bottom: "10%", left: "-8px" }}
          />
          <EyebrowLabel text="Vision" align="right" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">
            Our Vision
          </h2>
          <div className="space-y-4 text-gray-500 text-sm md:text-base leading-relaxed">
            <p>
              We believe Rwanda will look different after a generation of
              developers who learned by shipping — not by watching. Just as open
              source transformed the global tech industry, we believe it can
              transform ours.
            </p>
            <p>
              We foresee a thriving ecosystem where contributors from Kigali are
              building tools used worldwide, where a student's first PR opens
              doors to global opportunities, and where "made in Rwanda" is a
              mark of quality.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── VALUES */}
    <section className="py-24 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <EyebrowLabel text="What We Stand For" align="left" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
              Five things we don't negotiate on.
            </h2>
          </div>
          <p className="text-gray-500 text-base md:text-lg max-w-xs text-start leading-relaxed">
            These aren't values we put on a wall. They're the ones that show up
            in how we run sessions, review PRs, and treat new members.
          </p>
        </div>

        {/* Values list — data from VALUES constant */}
        <div className="divide-y divide-gray-100">
          {VALUES.map((v) => (
            <div
              key={v.number}
              className="group py-8 grid grid-cols-12 gap-6 items-start hover:bg-gray-50 hover:-mx-6 hover:px-6 rounded-xl transition-all duration-200 cursor-default"
            >
              <span className="col-span-2 md:col-span-1 text-gray-200 font-black text-2xl group-hover:text-blue-500 transition-colors font-mono">
                {v.number}
              </span>
              <div className="col-span-10 md:col-span-11 grid md:grid-cols-2 gap-2 md:gap-12 items-baseline">
                <h3 className="text-base md:text-xl font-bold text-gray-900">
                  {v.title}
                </h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  {v.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── TEAM ──────────────────────────────────────────────────────────────── */}
    <section className="py-24 px-6 md:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
              Leading, Strong<br />Creative Team
            </h2>
          </div>
          <p className="text-gray-500 text-base md:text-lg max-w-xs text-start leading-relaxed">
            OSK is led by a volunteer team of contributors who spend their own
            time making the community better for everyone else.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ABOUT_TEAM.map((m) => {

            // Build only the social links that are not null
            const socialLinks = [
              m.links.linkedin && { icon: <FaLinkedinIn size={12} />, href: m.links.linkedin, label: "LinkedIn" },
              m.links.github && { icon: <FaGithub size={12} />, href: m.links.github, label: "GitHub" },
              m.links.twitter && { icon: <FaXTwitter size={12} />, href: m.links.twitter, label: "Twitter" },
              m.links.instagram && { icon: <FaInstagram size={12} />, href: m.links.instagram, label: "Instagram" },
              m.links.facebook && { icon: <FaFacebookF size={12} />, href: m.links.facebook, label: "Facebook" },
              m.links.figma && { icon: <FaFigma size={12} />, href: m.links.figma, label: "Figma" },
            ].filter(Boolean) as { icon: React.ReactNode; href: string; label: string }[];

            return (
              <div
                key={m.initials}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                {/* Avatar area */}
                <div className="h-64 overflow-hidden relative">
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: m.objectPosition ?? "top" }}
                    />
                  ) : (
                    <div className={`${m.bg} w-full h-full flex items-center justify-center`}>
                      <span className="text-white font-black text-7xl opacity-20">
                        {m.initials}
                      </span>
                    </div>
                  )}
                  {m.featured && (
                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Lead
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="font-black text-gray-900 text-base">{m.name}</p>
                  <p className="text-blue-500 text-xs font-bold tracking-widest mt-0.5 mb-4">
                    {m.role}
                  </p>

                  {/* Only render icons the person actually has */}
                  {socialLinks.length > 0 && (
                    <div className="flex gap-2">
                      {socialLinks.map(({ icon, href, label }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
                        >
                          {icon}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── BOTTOM CTA */}
    <section className="py-24 px-6 md:px-20 bg-background-colour relative overflow-hidden">
      <Dot
        color="bg-blue-500"
        size="w-48 h-48"
        style={{ top: "-24px", right: "-24px", opacity: 0.08 }}
      />
      <Dot
        color="bg-blue-400"
        size="w-32 h-32"
        style={{ bottom: "-16px", left: "10%", opacity: 0.06 }}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10 relative z-10">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            Your first PR
            <br />
            <span className="text-blue-400">is one click away.</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <PrimaryButton to="/membersform">Join the Community</PrimaryButton>
          <SecondaryButton to="/projects">Browse Projects</SecondaryButton>
        </div>
      </div>
    </section>
  </div>
);

export default About;
