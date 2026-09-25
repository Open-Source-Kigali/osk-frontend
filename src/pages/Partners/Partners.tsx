import PartnerMarquee from '@/components/UI/PartnersMarquee';
import HeroSection from "./components/HeroSection";
import Banner from "./components/Banner";
import ProgrammeOverview from "./components/ProgrammeOverview";
import Benefit from "./components/Benefit";
import Process from "./components/Process";
import BecomeAPartner from "./components/BecomeAPartner";
import BottomCTA from './components/BottomCTA';


// ─── Page 

const Partners = () => (
  <div className="bg-white">
    <HeroSection/>
    <PartnerMarquee
      showSecondary={false}
      ctaTo="mailto:opensourcekigali@gmail.com"
    />
    <ProgrammeOverview/>
    <Banner />
    <Benefit/>
    <Process/>
    <BecomeAPartner/>
    <BottomCTA/>
  </div>
);

export default Partners;