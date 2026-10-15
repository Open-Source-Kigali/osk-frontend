
import image2 from "@/assets/images/open2.webp";
import image2Small from "@/assets/images/open2-640.webp";
import { ScrollAnimatedItem } from "@/components/UI/ScrollAnimatedItem";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import SecondaryButton from "@/components/UI/SecondaryButton";
const About = () => {
  return (
    <section className="py-16 md:py-28 px-4 md:px-20 bg-white">
        <ScrollAnimatedItem className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Left */}
          <div className="w-full md:w-1/2">
            <EyebrowLabel text="About Us" align="left" className="mb-4" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
              Empowering Rwanda through Open Source.
            </h2>
            <p className="text-base md:text-lg text-gray-500 mb-6">
              Open Source Kigali (OSK) is a community of developers, designers,
              and tech enthusiasts working together to empower Rwandans to
              contribute to open-source projects locally and globally.
            </p>
            <SecondaryButton to="/about">Learn More</SecondaryButton>
          </div>

          {/* Right */}
          <div className="w-full md:w-1/2">
            <img
              src={image2}
              srcSet={`${image2Small} 640w, ${image2} 1600w`}
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="lazy"
              alt="Team collaboration"
              className="w-full rounded-lg object-cover"
            />
          </div>
        </ScrollAnimatedItem>
      </section>
  )
}

export default About