import HeroSection from "@/pages/about/components/HeroSection";
import OurStory from "./components/OurStory";
import OurValues from "./components/OurValues";
import Teams from "./components/Teams";
import SEO from "@/components/SEO";
import { PAGE_SEO } from "@/config/seo";

//Page
const About = () => {
  return (
  <div className="font-sans">
    <SEO {...PAGE_SEO.about} />
    <HeroSection />
    <OurStory />
    <OurValues />
    <Teams/>
  </div>
  );
};

export default About;
