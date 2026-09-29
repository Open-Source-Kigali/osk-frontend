import PrimaryButton from "@/components/UI/PrimaryButton";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import links from "@/config/links";



const HeroSection = () => {
  return (
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
          <PrimaryButton to={links.partnerCTA}>
            Become a Partner
          </PrimaryButton>
          
        </div>
      </div>
    </section>
  )
}

export default HeroSection