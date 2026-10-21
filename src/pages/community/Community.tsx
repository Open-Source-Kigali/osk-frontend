import HeroSection from "./components/HeroSection";
import Channels from "./components/Channels";
import CommunityGuidelines from "./components/CommunityGuidelines";
import BottomCTA from "./components/BottomCTA";
import SEO from "@/components/SEO";
import { PAGE_SEO } from "@/config/seo";

const Community = () => {
  return (
    <>
      <SEO {...PAGE_SEO.community} />
      <HeroSection />
      <Channels />
      <CommunityGuidelines />
      <BottomCTA />
    </>
  );
};

export default Community;
