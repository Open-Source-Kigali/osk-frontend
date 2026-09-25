import { ScrollAnimatedItem } from "@/components/UI/ScrollAnimatedItem";
import { Building2, GraduationCap, Landmark, Heart } from "lucide-react";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import PrimaryButton from "@/components/UI/PrimaryButton";
import { PARTNERS} from "@/constants";





const ProgrammeOverview = () => {
  return (
    <section className="py-20 px-6 md:px-20 bg-white md:mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        <div>
          <EyebrowLabel text="The Program" align="left" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-snug mb-5">
            Help us build Rwanda's developer ecosystem.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-4">
            OSK doesn't grow alone. Our partners provide mentors, space, funding, and the
            real-world problems that make our contributor community thrive.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            We work with{" "}
            <strong className="text-gray-900">{PARTNERS.length} organisations</strong>{" "}
            across Rwanda and we're actively looking for more.
          </p>
          <PrimaryButton
            to="https://mail.google.com/mail/u/0/?to=opensourcekigali@gmail.com&su=Partnership+Enquiry&fs=1&tf=cm"
            popup={true}
            className="w-full sm:w-auto"
          >
            Partner with Us
          </PrimaryButton>
        </div>

        {/* Partner type breakdown — derived from PARTNERS constant */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: <GraduationCap size={22} className="text-violet-500" />,
              label: "Universities",
              count: PARTNERS.filter((p) => p.category === "university").length,
              bg: "bg-violet-50",
              border: "border-violet-100",
            },
            {
              icon: <Building2 size={22} className="text-blue-500" />,
              label: "Partner Organizations",
              count: PARTNERS.filter((p) => p.category === "company").length,
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              icon: <Landmark size={22} className="text-emerald-500" />,
              label: "Government",
              count: PARTNERS.filter((p) => p.category === "government").length,
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: <Heart size={22} className="text-rose-500" />,
              label: "NGOs & Hubs",
              count: PARTNERS.filter((p) => p.category === "ngo").length,
              bg: "bg-rose-50",
              border: "border-rose-100",
            },
          ].map((item, i) => (
            <ScrollAnimatedItem key={i} delay={i * 0.15} className={`${item.bg} border ${item.border} rounded-2xl p-6`}>
              <div className="mb-3">{item.icon}</div>
              <p className="text-3xl font-black text-gray-900 mb-1">{item.count}</p>
              <p className="text-sm font-semibold text-gray-600">{item.label}</p>
            </ScrollAnimatedItem>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProgrammeOverview