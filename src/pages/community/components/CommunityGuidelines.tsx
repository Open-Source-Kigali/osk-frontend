import EyebrowLabel from "@/components/UI/EyebrowLabel";
import { ScrollAnimatedItem } from "@/components/UI/ScrollAnimatedItem";
import { Shield } from "lucide-react";
import { GUIDELINES } from "@/constants";
import { Highlight } from "@/components/animate-ui/primitives/effects/highlight";

const CommunityGuidelines = () => {
  return (
    <section className="py-24 px-6 md:px-20 bg-gray-950">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div>
          <EyebrowLabel text="How we treat each other" align="left" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            Six rules.
            <br />
            <span className="text-gray-500">No fine print.</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            OSK is only as good as the people in it. These aren't policies
            written by a lawyer — they're the norms that have made this
            community a place people actually want to spend time.
          </p>
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-blue-400 shrink-0" />
            <p className="text-gray-500 text-sm">
              Violations are handled by the moderation team. Repeat offences
              result in removal.
            </p>
          </div>
        </div>

        {/* Right: rules — animated hover using animate-ui Highlight */}
        <Highlight
          hover
          mode="parent"
          className="bg-white/[0.08] border border-white/20 rounded-xl pointer-events-none"
          containerClassName="space-y-3"
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
        >
          {GUIDELINES.map((g, i) => (
            <ScrollAnimatedItem
              key={i}
              delay={i * 0.15}
              className="group flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 transition-colors duration-200 cursor-default"
            >
              <span className="text-gray-500 font-mono text-sm shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors duration-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors duration-200">
                {g.rule}
              </p>
            </ScrollAnimatedItem>
          ))}
        </Highlight>
      </div>
    </section>
  );
};

export default CommunityGuidelines