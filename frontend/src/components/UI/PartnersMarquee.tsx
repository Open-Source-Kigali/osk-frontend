import { MARQUEE_PARTNERS } from "@/constants";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

// How fast the marquee scrolls — higher = slower
const MARQUEE_DURATION = "30s";

// Tripling the array for seamless loop
const track = [
  ...MARQUEE_PARTNERS,
  ...MARQUEE_PARTNERS,
  ...MARQUEE_PARTNERS,
];

type Props = {
  showSecondary?: boolean;
};


const PartnersMarquee = ({ showSecondary = true }: Props) => {
  return (
    <section className="py-16 overflow-hidden" style={{ background: "#f0f6ff" }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">

          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#5b9fff" }}
            >
              Trusted by
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              Organisations that believe
              <br />
              <span style={{ color: "#2b7fff" }}>in Rwanda's builders.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <PrimaryButton to="/partnersform">
              Become a partner
            </PrimaryButton>

            {showSecondary && (
              <SecondaryButton to="">
                Learn more
              </SecondaryButton>
            )}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #f0f6ff, transparent)" }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #f0f6ff, transparent)" }}
        />

        {/* track */}
        <div
          className="flex gap-10 w-max"
          style={{ animation: `osk-marquee ${MARQUEE_DURATION} linear infinite` }}
        >
          {track.map((partner, i) => (
            <a
              key={`${partner.id}-${i}`}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              title={partner.name}
              className="shrink-0 flex items-center justify-center transition-all duration-300"
              style={{
                width: "200px",
                height: "90px",
              }}
            >
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 max-w-full w-auto object-contain"
                  draggable={false}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm"
                  style={{ background: partner.bg }}
                >
                  {partner.initials}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mt-10">
        <div
          className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-8 border-t"
          style={{ borderColor: "#c5d9ff" }}
        >
          {[
            {
              n: `${MARQUEE_PARTNERS.length}+`,
              label: "Partner organisations",
            },
            
            { n: "2", label: "Government partnerships" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline  gap-1.5">
              <span className="text-xl font-black" style={{ color: "#2b7fff" }}>
                {s.n}
              </span>
              <span className="text-base text-text-body">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* animation */}
      <style>{`
        @keyframes osk-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

export default PartnersMarquee;