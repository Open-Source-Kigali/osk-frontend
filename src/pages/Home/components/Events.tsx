import { NavLink } from "react-router";
import {  Calendar, Clock, MapPin} from "lucide-react";
import { Loader} from "@/components/UI";
import { ScrollAnimatedItem } from "@/components/UI/ScrollAnimatedItem";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import PrimaryButton from "@/components/UI/PrimaryButton";
import SecondaryButton from "@/components/UI/SecondaryButton";
import {  useEvents} from "@/hooks";
import type { HomeEventType} from "@/constants";





const EVENT_TYPE_STYLES: Record<HomeEventType, string> = {
  hackathon: "bg-blue-100 text-blue-600",
  workshop: "bg-green-100 text-green-600",
  meetup: "bg-purple-100 text-purple-600",
  session: "bg-orange-100 text-orange-600",
};

export const Events = () => {
    const { events, loading: eventsLoading, error: eventsError } = useEvents();
    
  const homeEvents = events
      .filter((e) => e.status !== "past")
      .slice(0, 4)
      .map((e) => {
        const type: HomeEventType = e.type === "talk" ? "session" : e.type;
        return {
          id: e.id,
          type,
          title: e.title,
          date: e.date,
          time: e.time,
          location: e.location,
          description: e.description,
          tag: type.charAt(0).toUpperCase() + type.slice(1),
          coverImage: e.coverImage,
        };
      });

      const featuredHomeEvent = homeEvents[0];
  const restHomeEvents = homeEvents.slice(1);

  return (
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

          {/* Events content */}
          {eventsLoading ? (
            <Loader />
          ) : eventsError ? (
            <p className="text-center text-sm text-gray-500 py-12">
              Failed to load events: {eventsError}
            </p>
          ) : null}

          {/* Empty state: no upcoming events */}
          {!eventsLoading && !eventsError && homeEvents.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 py-16 px-6 text-center">
              <p className="text-gray-500 text-base sm:text-lg mb-4">
                📅 No upcoming events right now. Check back soon!
              </p>
              <NavLink
                to="/event"
                className="text-blue-500 hover:underline text-sm md:text-base font-medium"
              >
                View All Events
              </NavLink>
            </div>
          )}

          {/* Featured event */}
          {!eventsLoading && !eventsError && featuredHomeEvent && (
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
                      to="/event"
                      className="w-full md:w-auto mb-3 md:mb-0"
                    >
                      Register Now
                    </PrimaryButton>
                    <SecondaryButton
                      to="/event"
                      className="w-full md:w-auto mb-3 md:mb-0"
                    >
                      Learn More
                    </SecondaryButton>
                  </div>
                </div>
                {featuredHomeEvent.coverImage ? (
                  <div className="md:w-1/3 h-56 md:h-auto overflow-hidden shrink-0">
                    <img
                      src={featuredHomeEvent.coverImage}
                      alt={featuredHomeEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="md:w-1/3 bg-blue-500 flex flex-col items-center justify-center p-10 text-white text-center">
                    <p className="text-6xl font-bold">48h</p>
                    <p className="mt-2 text-lg font-medium opacity-90">
                      Build Challenge
                    </p>
                    <p className="mt-4 text-sm opacity-75">
                      Open to all skill levels
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other events grid */}
          {!eventsLoading && !eventsError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restHomeEvents.map((event, idx) => (
                <ScrollAnimatedItem
                  key={event.id}
                  delay={idx * 0.15}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {event.coverImage && (
                    <div className="h-40 w-full overflow-hidden shrink-0">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
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
                        <Clock size={12} className="text-blue-400" />{" "}
                        {event.time}
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
                </ScrollAnimatedItem>
              ))}
            </div>
          )}
        </div>
      </section>
  )
}
