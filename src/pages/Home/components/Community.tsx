import EyebrowLabel from "@/components/UI/EyebrowLabel";
import {  EXPLORE_LINKS} from "@/constants";
import image12 from '@/assets/images/open12.webp';
import image12Small from '@/assets/images/open12-640.webp';
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";

const Community = () => {
  return (
    <section className="bg-[#FFF7F5] py-20 px-4 md:px-20">
        <EyebrowLabel text="Connect, Contribute and Learn" className="mb-4" />
        {/* Nav pills — from EXPLORE_LINKS constant */}
        <div className="flex flex-wrap justify-center items-center mb-16 gap-4 md:gap-8">
          {EXPLORE_LINKS.map((link) =>
            link.variant === "primary" ? (
              <PrimaryButton
                key={link.to}
                to={link.to}
                className="w-full md:w-auto"
              >
                {link.label}
              </PrimaryButton>
            ) : (
              <SecondaryButton
                key={link.to}
                to={link.to}
                className="w-full md:w-auto"
              >
                {link.label}
              </SecondaryButton>
            ),
          )}
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              Explore how you can connect, contribute and grow with us.
            </h2>
            <p className="text-base md:text-lg text-gray-500">
              Join a vibrant community of developers, designers and tech
              enthusiasts. Connect, collaborate, and build meaningful
              open-source projects together. Meet like-minded creators, share
              ideas, and grow through open source while creating solutions with
              local and global impact.
            </p>
            <SecondaryButton to="/community">Learn More →</SecondaryButton>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={image12}
              srcSet={`${image12Small} 640w, ${image12} 1350w`}
              sizes="(min-width: 1024px) 50vw, 100vw"
              loading="lazy"
              alt="Community collaboration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
  )
}

export default Community