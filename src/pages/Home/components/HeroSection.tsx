import CountUp from "react-countup";
import HeroSlideshow from '@/pages/Home/components/HeroSlideshow';
import heroImages from '@/pages/Home/data/heroImages';
import { HERO_STATS } from "@/constants";
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";
import { ScrollAnimatedItem } from "@/components/UI/ScrollAnimatedItem";
import primaryCTALink from '@/config/links'
import { Skeleton } from "@/components/UI";
import { useStats } from "@/hooks/useStats";

const HeroSection = () => {
    const { stats, loading: statsLoading } = useStats();
    return (

        <section className="relative  w-full min-h-screen">
            <HeroSlideshow images={heroImages} />


            <div className="z-10 h-full pt-28 md:pt-34 px-4 md:px-20 space-y-8">
                <h1 className="text-3xl text-center sm:text-start sm:text-3xl md:text-4xl lg:text-6xl leading-snug text-white font-bold max-w-3xl">
                    Empowering Rwanda <br className="sm:hidden " />
                    to Build the{" "}
                    <span>
                        Future <br className="sm:hidden " />
                        of Open Source
                    </span>
                </h1>

                <p className="text-white/90 text-center sm:text-start font-medium text-base sm:text-base md:text-xl leading-relaxed max-w-2xl">
                    OSK unites developers, designers, and tech enthusiasts to contribute
                    to open-source projects locally and globally. Join us in turning the
                    next billion users into the next billion creators.
                </p>

                <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start mt-16">
                    <PrimaryButton to={primaryCTALink.social.discord}>
                        Join the community
                    </PrimaryButton>
                    <SecondaryButton to="/about">Know More About Us</SecondaryButton>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-16 mt-16 pt-6">
                    {HERO_STATS.map((stat, index) => (
                        <ScrollAnimatedItem
                            key={stat.label}
                            delay={index * 0.15}
                            className={`flex-1 min-w-20 py-4 ${index !== HERO_STATS.length - 1
                                    ? "md:border-r border-gray-300"
                                    : ""
                                } text-center md:text-left`}
                        >
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                                {statsLoading ? (
                                    <Skeleton className="h-8 md:h-9 w-16 bg-white/20" />
                                ) : (
                                    <CountUp prefix="+" end={stats?.[stat.key] ?? 0} duration={5} separator="," />
                                )}
                            </p>
                            <p className="text-sm sm:text-base md:text-lg text-primary-colour font-medium mt-1">
                                {stat.label}
                            </p>
                        </ScrollAnimatedItem>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection