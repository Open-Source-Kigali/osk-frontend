import { formatStat } from "@/lib/formatters";
import { Skeleton } from "@/components/UI";
import image13 from "@/assets/images/open13.webp";
import image13Small from "@/assets/images/open13-640.webp";
import { ABOUT_STATS } from "@/constants";
import { useStats } from "@/hooks/useStats";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";
import primaryCTALink from '@/config/links'



interface DotProps {
  color: string;
  size: string;
  style?: React.CSSProperties;
}


// Purely decorative floating blob — no logic, no state
const Dot = ({ color, size, style }: DotProps) => (
    <div
        className={`absolute rounded-full ${color} ${size}`}
        style={{ opacity: 0.85, ...style }}
    />
);


const HeroSection = () => {
    const { stats, loading } = useStats();

    return (
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
                    <PrimaryButton
                        to={primaryCTALink.social.discord}
                        className="w-full md:w-auto"
                    >
                        Join the Community
                    </PrimaryButton>
                    <SecondaryButton to="/projects" className="w-full  md:w-auto">
                        View Projects
                    </SecondaryButton>
                </div>

                <div className="w-full">
                    <img
                        src={image13}
                        srcSet={`${image13Small} 640w, ${image13} 1350w`}
                        sizes="(min-width: 1024px) 896px, 100vw"
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
                                {loading ? (
                                    <Skeleton className="h-7 md:h-8 w-14" />
                                ) : (
                                    formatStat(stats?.[s.key] ?? 0)
                                )}
                            </span>
                            <span className="text-gray-500 text-base uppercase">
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection