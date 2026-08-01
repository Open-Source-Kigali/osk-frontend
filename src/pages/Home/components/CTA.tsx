import { NavLink } from "react-router";
import { formatStat } from "@/lib/formatters";
import { ArrowRight, GitMerge, UserPlus, GitPullRequest, Zap} from "lucide-react";
import {  CTA_ACTIVITY, CTA_STATS} from "@/constants";
import primaryCTALink from '@/config/links'
import { Skeleton } from "@/components/UI";
import PrimaryButton from "@/components/UI/PrimaryButton";
import {   useStats } from "@/hooks";
import type { ActivityIconKey } from "@/constants";




const ACTIVITY_ICONS: Record<ActivityIconKey, React.ReactNode> = {
  merge: <GitMerge size={13} />,
  join: <UserPlus size={13} />,
  pr: <GitPullRequest size={13} />,
  event: <Zap size={13} />,
};



const CTA = () => {
    const { stats, loading: statsLoading } = useStats();
  return (
    <section
        className="relative overflow-hidden py-24 px-4 md:px-20"
        style={{ background: "#0a0f1e" }}
      >
        {/* Glow blobs */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-xs tracking-wide uppercase">
                Community is live · Join 1500+ contributors
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Stop <span className="text-gray-400 line-through">learning.</span>
              <br />
              Start <span className="text-primary-colour">building.</span>
            </h2>

            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Real skills come from real contributions. Open Source Kigali
              connects you to live projects, active mentors, and a community of
              builders shaping Rwanda's tech future.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <PrimaryButton to={primaryCTALink.social.discord} className="group">
                Join the Community
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </PrimaryButton>
              
              <a href="https://github.com/Open-Source-Kigali/osk-frontend/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base px-5 py-2.5 md:px-7 md:py-3 bg-transparent hover:bg-primary-colour text-blue-500 hover:text-white border border-blue-500 hover:scale-[1.05] hover:shadow-lg font-semibold rounded-full transition"
              >
                View Open Issues
              </a>
            </div>

            {/* Stat pills — from CTA_STATS constant */}
            <div className="flex flex-wrap gap-3">
              {CTA_STATS.map((s) => (
                <div
                  key={s.label}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/5"
                >
                  <span className="text-white font-bold text-sm">
                    {statsLoading ? (
                      <Skeleton className="h-3.5 w-8 bg-white/20" />
                    ) : (
                      formatStat(stats?.[s.key] ?? 0)
                    )}
                  </span>
                  <span className="text-gray-500 text-sm ml-1.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Activity feed — from CTA_ACTIVITY constant */}
          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden border border-white/10"
              style={{
                background: "#111827",
                boxShadow:
                  "0 0 0 1px rgba(59,130,246,0.1), 0 32px 64px rgba(0,0,0,0.5)",
              }}
            >
              {/* Mac-style header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-white/3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-gray-500 text-xs font-mono">
                    live activity
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-white/5">
                {CTA_ACTIVITY.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-white/3 transition-colors"
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${item.iconBg}`}
                    >
                      {ACTIVITY_ICONS[item.iconKey]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm leading-snug">
                        {item.text}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-5 py-3.5 border-t border-white/8 bg-white/2 flex items-center justify-between">
                <span className="text-gray-600 text-xs font-mono">
                  github · opensourcekigali
                </span>
                <NavLink
                  to="/community"
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                >
                  View all activity →
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default CTA