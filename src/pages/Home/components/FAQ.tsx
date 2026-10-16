import { FAQ_ITEMS } from "@/constants";
import coachImg from "@/assets/images/people-avatar.webp";
import { Plus } from "lucide-react";
import primaryCTALink from "@/config/links";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  useAccordionItem,
} from "@/components/animate-ui/components/base/accordion";
import { cn } from "@/lib/utils";

function FaqToggleIcon() {
  const { isOpen } = useAccordionItem();
  return (
    <span className="shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 transition-colors duration-200">
      <Plus
        size={14}
        className={cn(
          "transition-transform duration-300 ease-in-out",
          isOpen && "rotate-45"
        )}
      />
    </span>
  );
}

const FAQ = () => {
  return (
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

        {/* Accordion — animated using animate-ui Base UI components */}
        <Accordion className="flex flex-col gap-3 mb-8">
          {FAQ_ITEMS.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={String(faq.id)}
              className="bg-white rounded-2xl border border-gray-100 border-b-0 overflow-hidden hover:shadow-sm transition-shadow duration-200"
            >
              <AccordionTrigger
                showArrow={false}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:no-underline cursor-pointer"
              >
                <span className="text-gray-900 font-medium text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                <FaqToggleIcon />
              </AccordionTrigger>

              <AccordionPanel className="px-6 pb-6 text-gray-500 text-sm sm:text-base leading-relaxed">
                {faq.answer}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

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
              href={primaryCTALink.social.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2.5 bg-primary-colour text-white text-sm font-medium rounded-full hover:opacity-90 transition-colors duration-200"
            >
              Message the Community
            </a>
          </div>
        </div>
      </section>
  )
}

export default FAQ