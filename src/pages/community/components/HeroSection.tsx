import { formatStat } from "@/lib/formatters";
import { Skeleton } from "@/components/UI";
import { COMMUNITY_STATS } from "@/constants";
import PrimaryButton from "@/components/UI/PrimaryButton";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import { useStats } from "@/hooks";
import primaryCTALink from "@/config/links";
import { ArrowUpRight } from "lucide-react";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

const HeroSection = () => {
  const { stats, loading } = useStats();
  if (loading) return <LoadingSpinner page="community" />;

  return (
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
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    formatStat(stats?.[s.key] ?? 0)
                  )}
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
            <span className="font-semibold text-gray-900">1500+ people</span>{" "}
            already building — come meet them.
          </p>
          <PrimaryButton to={primaryCTALink.social.discord} className="">
            Join the Community Now <ArrowUpRight size={14} />
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
