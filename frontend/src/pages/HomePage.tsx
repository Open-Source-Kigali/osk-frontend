import { useState,  } from "react";
import { NavLink } from "react-router";
//import useEmblaCarousel from "embla-carousel-react";
import CountUp from "react-countup";
import {  ChevronLeft, ChevronRight, Quote, GitMerge, UserPlus, GitPullRequest, Zap, ArrowRight,  Calendar, Clock, MapPin, Plus, Minus} from "lucide-react";
import { useAutoPlay, useProjects, useEvents } from "@/hooks";
import { HERO_STATS,  EXPLORE_LINKS, TESTIMONIALS, CTA_ACTIVITY, CTA_STATS, FAQ_ITEMS,} from "@/constants";
import type {  HomeEventType, ActivityIconKey} from "@/constants";
import PartnersMarquee from "@/components/UI/PartnersMarquee";

// ── Assets
import heroImage from "@/assets/images/HeroImage.jpeg";
import peopleImg from "@/assets/images/People.jpeg";
import groupImg from "@/assets/images/did.jpeg.jpeg";
import coachImg from "@/assets/images/People.jpeg";
import youthImg from "@/assets/images/Youth meetup.jpg";
import peopleImg2 from "@/assets/images/People.jpeg";
import smartImg from "@/assets/images/smart devices.jpg";
import mapImg from "@/assets/images/Map.jpg";
import EyebrowLabel from "@/components/UI/EyebrowLable";
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";

{/* ── Static icon maps
const CONTRIBUTION_ICONS: Record<ContributionType, React.ReactNode> = {
  developer: <Laptop size={28} />,
  designer: <Palette size={28} />,
  documentation: <FileText size={28} />,
  moderator: <Users size={28} />,
};
*/}

const ACTIVITY_ICONS: Record<ActivityIconKey, React.ReactNode> = {
  merge: <GitMerge size={13} />,
  join: <UserPlus size={13} />,
  pr: <GitPullRequest size={13} />,
  event: <Zap size={13} />,
};

const EVENT_TYPE_STYLES: Record<HomeEventType, string> = {
  hackathon: "bg-blue-100 text-blue-600",
  workshop: "bg-green-100 text-green-600",
  meetup: "bg-purple-100 text-purple-600",
  session: "bg-orange-100 text-orange-600",
};

// Project images map by slug
const PROJECT_IMAGES: Record<string, string> = {
  "kigali-community-hub": youthImg,
  "edutrack-rwanda": peopleImg2,
  afyaconnect: smartImg,
  "openrwanda-map": mapImg,
};


// ─── Page
const HomePage = () => {
  // Testimonials auto-play
  const { current, paused, next, prev, goTo, setPaused } = useAutoPlay({
    length: TESTIMONIALS.length,
    interval: 4000,
  });

  {/*Contribution carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });
  const [emblaIndex, setEmblaIndex] = useState(0);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  */}

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Visible testimonials
  const visibleTestimonials = Array.from(
    { length: 3 },
    (_, i) => TESTIMONIALS[(current + i) % TESTIMONIALS.length],
  );

  // Projects for homepage (first 4)
  const { projects } = useProjects();
  const homeProjects = projects.slice(0, 4);
  const featuredProject = homeProjects[0];

  // Events for homepage (upcoming, capped at 4)
  const { events } = useEvents();
  const homeEvents = events
    .filter((e) => e.status !== "past")
    .slice(0, 4)
    .map((e) => {
      const type: HomeEventType = e.type === "talk" ? "session" : e.type;
      return {
        id:          e.id,
        type,
        title:       e.title,
        date:        e.date,
        time:        e.time,
        location:    e.location,
        description: e.description,
        tag:         type.charAt(0).toUpperCase() + type.slice(1),
      };
    });
  const featuredHomeEvent = homeEvents[0];
  const restHomeEvents    = homeEvents.slice(1);

  return (
    <div className="font-sans">

      {/*  1. HERO */}
      <section className="relative w-full min-h-screen">
        {/* Background */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 -z-10 bg-gray-950/75" />

        {/* Content */}
        <div className="z-10 h-full pt-28 md:pt-34 px-4 md:px-25 space-y-8">
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
            <PrimaryButton to='/membersform'>
              Join the community
            </PrimaryButton>
            <SecondaryButton to='/about'>
              Know More About Us
            </SecondaryButton>
          </div>

          {/* Stats — from HERO_STATS constant */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-16 mt-16 pt-6">
            {HERO_STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex-1 min-w-20 py-4 ${
                  index !== HERO_STATS.length - 1
                    ? "md:border-r border-gray-300"
                    : ""
                } text-center md:text-left`}
              >
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  <CountUp end={stat.number} duration={5} separator="," />
                </p>
                <p className="text-sm sm:text-base md:text-lg text-primary-colour font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="py-16 md:py-28 px-4 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
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
              src={peopleImg}
              alt="Team collaboration"
              className="w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </section>


      {/* FEATURED PROJECTS */}
      <section className="py-20 px-4 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <EyebrowLabel text="Open Source Project" align="left" />
          <div className="flex justify-between flex-wrap items-center mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Featured Open Source Projects
            </h2>
            <NavLink
              to="/projects"
              className="text-blue-500 hover:underline text-base md:text-lg"
            >
              View All Projects
            </NavLink>
          </div>

          {/* Featured — first project */}
          {featuredProject && (
            <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-lg mb-12 md:flex md:items-stretch border border-gray-100">
              <div className="md:w-1/2 h-64 sm:h-80 md:h-auto relative">
                <img
                  src={
                    featuredProject.image ||
                    PROJECT_IMAGES[featuredProject.slug] ||
                    youthImg
                  }
                  alt={featuredProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 md:hidden bg-black opacity-25" />
              </div>
              <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white z-10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 text-brand-950">
                  {featuredProject.title}
                </h3>
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                  {featuredProject.description || featuredProject.tagline}
                </p>
                <div className="flex gap-3 sm:gap-4 flex-wrap">
                  <PrimaryButton
                    to={featuredProject.repoUrl}
                    className="w-full md:w-auto"
                  >
                    Contribute
                  </PrimaryButton>
                  <SecondaryButton
                    to={featuredProject.liveUrl || featuredProject.repoUrl}
                    className="w-full md:w-auto"
                  >
                    View Project
                  </SecondaryButton>
                </div>
              </div>
            </div>
          )}

          {/* Other projects grid — remaining 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {homeProjects.slice(1).map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={
                      project.image || PROJECT_IMAGES[project.slug] || youthImg
                    }
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-semibold mb-3 text-base sm:text-lg text-gray-900">
                    {project.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {project.description}
                  </p>
                  <div className="flex gap-2.5 sm:gap-3 flex-wrap my-3">
                    <PrimaryButton to={project.repoUrl} className="w-full">
                      Contribute
                    </PrimaryButton>
                    <SecondaryButton
                      to={project.liveUrl || project.repoUrl}
                      className="w-full"
                    >
                      View Project
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTRIBUTION SECTION 
      <section className="py-20 px-4 md:px-20 text-center bg-white">
        <div className="max-w-7xl mx-auto">
          <EyebrowLabel text="Ways to Contribute" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 max-w-3xl mx-auto leading-tight">
            Ways you can get involved and shape the open source community
          </h2>
          <p className="mt-6 text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            Whether you code, design, write, or mentor, there's a place for you
            in the open source community. Explore opportunities to contribute,
            grow your skills, and make meaningful impact.
          </p>

          {/* Embla Carousel — from CONTRIBUTION_SLIDES constant 
          <div className="max-w-6xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {CONTRIBUTION_SLIDES.map((slide, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.3333%]"
                  >
                    {/* Contribution Card — inline 
                    <div className="bg-slate-100 rounded-3xl p-8 flex flex-col justify-between min-h-90 transition duration-300 hover:shadow-xl text-left">
                      <div>
                        <div className="text-blue-500 mb-4">
                          {CONTRIBUTION_ICONS[slide.type]}
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                          {slide.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {slide.description}
                        </p>
                      </div>
                      <SecondaryButton to="">
                        Contribution Guide
                      </SecondaryButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel navigation 
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100 transition"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {CONTRIBUTION_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      emblaApi?.scrollTo(index);
                      setEmblaIndex(index);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === emblaIndex ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={scrollNext}
                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100 transition"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      */}


      {/* EXPLORE / CONNECT */}
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
              src={groupImg}
              alt="Community collaboration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* EVENTS PREVIEW */}
      <section className="py-20 px-4 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-12 gap-4">
            <div>
              <EyebrowLabel text="Community Events" align="left" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Upcoming Events & Activities
              </h2>
            </div>
            <NavLink
              to="/event"
              className="text-blue-500 hover:underline text-sm md:text-lg"
            >
              View All Events
            </NavLink>
          </div>

          {/* Featured event */}
          {featuredHomeEvent && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8 border border-gray-100">
            <div className="md:flex">
              <div className="md:w-2/3 p-6 sm:p-8 md:p-10">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${EVENT_TYPE_STYLES[featuredHomeEvent.type]}`}
                >
                  {featuredHomeEvent.tag}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-4 mb-3">
                  {featuredHomeEvent.title}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                  {featuredHomeEvent.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />{" "}
                    {featuredHomeEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />{" "}
                    {featuredHomeEvent.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-500" />{" "}
                    {featuredHomeEvent.location}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton
                    to=""
                    className="w-full md:w-auto mb-3 md:mb-0"
                  >
                    Register Now
                  </PrimaryButton>
                  <SecondaryButton
                    to=""
                    className="w-full md:w-auto mb-3 md:mb-0"
                  >
                    Learn More
                  </SecondaryButton>
                </div>
              </div>
              <div className="md:w-1/3 bg-blue-500 flex flex-col items-center justify-center p-10 text-white text-center">
                <p className="text-6xl font-bold">48h</p>
                <p className="mt-2 text-lg font-medium opacity-90">
                  Build Challenge
                </p>
                <p className="mt-4 text-sm opacity-75">
                  Open to all skill levels
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Other events grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restHomeEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${EVENT_TYPE_STYLES[event.type]}`}
                >
                  {event.tag}
                </span>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mt-4 mb-2">
                  {event.title}
                </h4>
                <p className="text-gray-500 text-sm flex-1 mb-4">
                  {event.description}
                </p>
                <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-blue-400" />{" "}
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-blue-400" /> {event.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-blue-400" />{" "}
                    {event.location}
                  </span>
                </div>
                <NavLink
                  to="/event"
                  className="mt-5 text-sm text-blue-500 font-medium hover:underline"
                >
                  RSVP →
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 px-4 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <EyebrowLabel text="Community Voices" align="center" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">
              What Our Contributors Say
            </h2>
            <p className="mt-4 text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Real stories from real people who've grown through Open Source
              Kigali.
            </p>
          </div>

          {/* Cards — pause on hover */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {visibleTestimonials.map((t, i) => (
              <div
                key={`${t.id}-${current}-${i}`}
                className={`bg-gray-50 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 ${
                  i === 0
                    ? "flex"
                    : i === 1
                      ? "hidden md:flex"
                      : "hidden lg:flex"
                }`}
              >
                <Quote size={28} style={{ color: "#5b9fff" }} />
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center items-center mt-10 gap-4">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className="rounded-full transition-all duration-300 overflow-hidden shrink-0"
                  style={
                    i === current
                      ? { width: "24px", height: "10px", background: "#e8f1ff" }
                      : { width: "10px", height: "10px", background: "#d1d5db" }
                  }
                >
                  {i === current && (
                    <div
                      key={current}
                      className="h-full rounded-full"
                      style={{
                        background: "#2b7fff",
                        animation: paused
                          ? "none"
                          : "osk-dot-progress 4000ms linear forwards",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes osk-dot-progress {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>
      </section>

      {/* PARTNERS MARQUEE */}
      <PartnersMarquee/>
      

      {/* FAQ */}
      <section className="py-20 px-4 md:px-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary-colour/40 bg-primary-colour/10 text-primary-colour text-xs font-semibold tracking-widest uppercase">
              Clear the Confusion
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Frequently Asked Questions
          </h2>

          {/* Subtitle */}
          <p className="text-center text-gray-500 text-base md:text-lg mb-12">
            Everything you need to know about joining OSK, contributing to
            projects, and what to expect from the Community.
          </p>

          {/* Accordion — data from FAQ_ITEMS constant */}
          <div className="flex flex-col gap-3 mb-8">
            {FAQ_ITEMS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-gray-900 font-medium text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    <span className="shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  {/* Animated answer */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-6 pb-6 text-gray-500 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Still have questions card */}
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between px-6 py-5 gap-4 overflow-hidden relative">
            {/* Left accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-colour rounded-l-2xl" />

            <div className="flex items-center gap-4 pl-4">
              <img
                src={coachImg}
                alt="Community team"
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  Still have questions?
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Can't find the answer you're looking for? Let's chat.
                </p>
              </div>
            </div>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2.5 bg-primary-colour text-white text-sm font-medium rounded-full hover:opacity-90 transition-colors duration-200"
            >
              Message the Community
            </a>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section
        className="relative overflow-hidden py-24 px-4 md:px-20"
        style={{ background: "#0a0f1e" }}
      >
        {/* Glow blobs */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-xs tracking-wide uppercase">
                Community is live · Join 100+ contributors
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Stop <span className="text-gray-400 line-through">learning.</span>
              <br />
              Start <span className="text-primary-colour">building.</span>
            </h2>

            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Real skills come from real contributions. Open Source Kigali
              connects you to live projects, active mentors, and a community of
              builders shaping Rwanda's tech future.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <PrimaryButton to="/membersform">
                Join the Community
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </PrimaryButton>
              <SecondaryButton to="">View Open Issues</SecondaryButton>
            </div>

            {/* Stat pills — from CTA_STATS constant */}
            <div className="flex flex-wrap gap-3">
              {CTA_STATS.map((s) => (
                <div
                  key={s.label}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/5"
                >
                  <span className="text-white font-bold text-sm">
                    {s.value}
                  </span>
                  <span className="text-gray-500 text-sm ml-1.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Activity feed — from CTA_ACTIVITY constant */}
          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden border border-white/10"
              style={{
                background: "#111827",
                boxShadow:
                  "0 0 0 1px rgba(59,130,246,0.1), 0 32px 64px rgba(0,0,0,0.5)",
              }}
            >
              {/* Mac-style header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-white/3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-gray-500 text-xs font-mono">
                    live activity
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-white/5">
                {CTA_ACTIVITY.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-white/3 transition-colors"
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${item.iconBg}`}
                    >
                      {ACTIVITY_ICONS[item.iconKey]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm leading-snug">
                        {item.text}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-5 py-3.5 border-t border-white/8 bg-white/2 flex items-center justify-between">
                <span className="text-gray-600 text-xs font-mono">
                  github · opensourcekigali
                </span>
                <NavLink
                  to="/community"
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                >
                  View all activity →
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
