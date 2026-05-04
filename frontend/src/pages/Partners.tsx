import { NavLink, Link } from "react-router";
import { ArrowRight, ArrowUpRight, Users, BookOpen, Briefcase, Globe, CheckCircle, Mail, Building2, GraduationCap, Landmark, Heart } from "lucide-react";
import { PARTNERS, PARTNER_BENEFITS, PARTNERSHIP_STEPS, PARTNER_STATS, WHAT_WE_LOOK_FOR } from "@/constants";
import EyebrowLabel from "../components/UI/EyebrowLable";
import PartnerMarquee from '@/components/UI/PartnersMarquee';
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";


// Icon map for benefits — keeps PARTNER_BENEFITS JSX-free in constants
const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  users: <Users size={20} />,
  book: <BookOpen size={20} />,
  globe: <Globe size={20} />,
  briefcase: <Briefcase size={20} />,
  building: <Building2 size={20} />,
  check: <CheckCircle size={20} />,
};

// ─── Page 

const Partners = () => (
  <div className="bg-white">

    {/* ── HERO */}
    <section
      className="relative pt-36 pb-28 px-6 md:px-20 overflow-hidden"
      style={{ background: "linear-gradient(150deg, #f0f4ff 0%, #ffffff 60%)" }}
    >
      <div
        className="absolute w-80 h-80 rounded-full -top-16 -left-16 pointer-events-none"
        style={{ background: "#dbeafe", filter: "blur(60px)", opacity: 0.5 }}
      />
      <div
        className="absolute w-60 h-60 rounded-full top-10 right-10 pointer-events-none"
        style={{ background: "#ede9fe", filter: "blur(50px)", opacity: 0.4 }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <EyebrowLabel text="OSK Partner Programme" align="center" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-6">
          Turning partnerships into
          <br />
          <span className="text-blue-500">real community impact.</span>
        </h1>
        <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
          We collaborate with universities, companies, government bodies, and innovation
          hubs to grow Rwanda's open-source ecosystem and build software that matters.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <PrimaryButton to="/partnersform">
            Become a Partner
          </PrimaryButton>
          <SecondaryButton to="">
            View Our Partners
          </SecondaryButton>
        </div>
      </div>
    </section>

    {/* ── MARQUEE */}
    <PartnerMarquee showSecondary={false} />

    {/* STAT CARDS — from PARTNER_STATS constant */}
    <section className="py-14 px-6 md:px-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-5">
        {PARTNER_STATS.map((s, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-2xl px-6 py-7 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <p className="text-4xl font-black text-gray-900 mb-1">{s.n}</p>
            <p className="text-base font-bold text-gray-700 mb-1">{s.label}</p>
            <p className="text-sm text-gray-400 leading-relaxed">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── PROGRAMME OVERVIEW */}
    <section className="py-20 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        <div>
          <EyebrowLabel text="The Program" align="left" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-snug mb-5">
            Help us build Rwanda's developer ecosystem.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-4">
            OSK doesn't grow alone. Our partners provide mentors, space, funding, and the
            real-world problems that make our contributor community thrive.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            We work with{" "}
            <strong className="text-gray-900">{PARTNERS.length} organisations</strong>{" "}
            across Rwanda and we're actively looking for more.
          </p>
          <PrimaryButton to="" className="md:w-1/2">
            Partner with Us
          </PrimaryButton>
        </div>

        {/* Partner type breakdown — derived from PARTNERS constant */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: <GraduationCap size={22} className="text-violet-500" />,
              label: "Universities",
              count: PARTNERS.filter((p) => p.category === "university").length,
              bg: "bg-violet-50",
              border: "border-violet-100",
            },
            {
              icon: <Building2 size={22} className="text-blue-500" />,
              label: "Companies",
              count: PARTNERS.filter((p) => p.category === "company").length,
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              icon: <Landmark size={22} className="text-emerald-500" />,
              label: "Government",
              count: PARTNERS.filter((p) => p.category === "government").length,
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: <Heart size={22} className="text-rose-500" />,
              label: "NGOs & Hubs",
              count: PARTNERS.filter((p) => p.category === "ngo").length,
              bg: "bg-rose-50",
              border: "border-rose-100",
            },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} border ${item.border} rounded-2xl p-6`}>
              <div className="mb-3">{item.icon}</div>
              <p className="text-3xl font-black text-gray-900 mb-1">{item.count}</p>
              <p className="text-sm font-semibold text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── INLINE CTA BANNER */}
    <div className="px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-background-colour rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-white font-black text-lg leading-snug">
              Ready to partner with OSK?
            </p>
            <p className="text-blue-100 text-sm mt-1">
              We respond to all enquiries within 48 hours.
            </p>
          </div>
          <SecondaryButton to="">
            Get in touch <ArrowRight size={14} />
          </SecondaryButton>
        </div>
      </div>
    </div>

    {/* ── BENEFITS — from PARTNER_BENEFITS constant */}
    <section className="py-20 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        <div className="lg:sticky lg:top-28">
          <EyebrowLabel text="Why Partner with OSK" align="left" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-snug mb-5">
            What you get when
            <br />you build with us.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Partnerships are mutual. We ask for your support and we give something real back —
            every time.
          </p>
          <Link
            to=""
            className="inline-flex items-center gap-2 text-base font-bold text-primary-colour border-b-2 border-primary-colour pb-0.5 hover:opacity-80 transition-colors"
          >
            Get in touch about a partnership <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PARTNER_BENEFITS.map((b, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.iconBg} ${b.iconColor} mb-4`}>
                {BENEFIT_ICONS[b.iconKey]}
              </div>
              <h3 className="text-base font-black text-gray-900 mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS — from PARTNERSHIP_STEPS constant */}
    <section className="py-20 px-6 md:px-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        <div className="divide-y divide-gray-200">
          <div className="pb-8">
            <EyebrowLabel text="The Process" align="left" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-snug">
              Four steps.
              <br />No bureaucracy.
            </h2>
          </div>
          {PARTNERSHIP_STEPS.map((s, i) => (
            <div key={i} className="py-7 flex gap-5">
              <span className="text-2xl font-black text-gray-200 font-mono leading-none w-8 shrink-0">
                {s.n}
              </span>
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-base leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:pt-24">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <p className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">
              What we look for
            </p>
            {/* From WHAT_WE_LOOK_FOR constant */}
            <div className="space-y-4 mb-8">
              {WHAT_WE_LOOK_FOR.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-gray-500 text-base leading-snug">{item}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-gray-100">
              <p className="text-gray-400 text-sm leading-relaxed">
                Partnerships are open to any organisation — big or small. If you're unsure
                whether you qualify, just reach out. The worst we can say is{" "}
                <em>not yet.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── BECOME A PARTNER */}
    <section id="become" className="py-20 px-6 md:px-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <EyebrowLabel text="Become a partner" align="left" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-5">
            Want your organisation
            <br />
            <span className="text-primary-colour">on this page?</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            We're looking for universities, companies, and government institutions ready to
            invest in Rwanda's open-source ecosystem. No forms. No RFPs. Just a conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          <div className="space-y-4">
            <a
              href="mailto:opensourcekigali@gmail.com?subject=Partnership Enquiry"
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-base">Email us directly</p>
                <p className="text-gray-500 text-sm font-mono mt-0.5">
                  opensourcekigali@gmail.com
                </p>
              </div>
              <ArrowUpRight size={16} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
            </a>

            <NavLink
              to="/contact"
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                <Globe size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-base">Use the contact form</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  Takes 2 minutes. We'll route it to the right person.
                </p>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
            </NavLink>

            {/* Social proof — derived from PARTNERS constant */}
            <div className="flex items-center gap-3 pt-2 pl-1">
              <div className="flex -space-x-2">
                {["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500"].map((c, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center`}
                  >
                    <Users size={12} className="text-white" />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                Joined by{" "}
                <strong className="text-gray-700">{PARTNERS.length} organisations</strong>{" "}
                across Rwanda
              </p>
            </div>
          </div>

          {/* Tier guide */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-7">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
              Not sure what do?
            </p>

            <div className="mt-7 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-400">
                We respond to all partnership enquiries within{" "}
                <strong className="text-gray-600">48 hours.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── BOTTOM CTA  */}
    <section className="py-14 px-6 md:px-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            See what we're building.
            <br />
            <span className="text-blue-500">Your team could be part of it.</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <NavLink
            to="/projects"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full text-sm transition-colors"
          >
            Browse Projects <ArrowUpRight size={14} />
          </NavLink>
          <NavLink
            to="/about"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900 rounded-full text-sm font-medium transition-colors"
          >
            About OSK
          </NavLink>
        </div>
      </div>
    </section>
  </div>
);

export default Partners;