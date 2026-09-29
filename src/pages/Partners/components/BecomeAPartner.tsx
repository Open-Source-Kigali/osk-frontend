import { PARTNERS } from "@/constants";
import links from "@/config/links";
import EyebrowLabel from "@/components/UI/EyebrowLabel";
import { NavLink } from "react-router";
import {  ArrowUpRight, Users, Globe,  Mail} from "lucide-react";



const BecomeAPartner = () => {
  return (
    <section id="become" className="py-20 px-6 md:px-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <EyebrowLabel text="Become a partner" align="left" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-5">
            Want your organisation
            <br />
            <span className="text-primary-colour">on this page?</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            We're looking for universities, companies, and government institutions ready to
            invest in Rwanda's open-source ecosystem. No forms. No RFPs. Just a conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          <div className="space-y-4">
            <a
              href={links.partnerCTA}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-base">Email us directly</p>
                <p className="text-gray-500 text-sm font-mono mt-0.5">
                  {links.partnerEmail}
                </p>
              </div>
              <ArrowUpRight size={16} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
            </a>

            <NavLink
              to="/partnersform"
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                <Globe size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-base">Use the contact form</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  Takes 2 minutes. We'll route it to the right person.
                </p>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
            </NavLink>

            {/* Social proof — derived from PARTNERS constant */}
            <div className="flex items-center gap-3 pt-2 pl-1">
              <div className="flex -space-x-2">
                {["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500"].map((c, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center`}
                  >
                    <Users size={12} className="text-white" />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                Joined by{" "}
                <strong className="text-gray-700">{PARTNERS.length} organisations</strong>{" "}
                across Rwanda
              </p>
            </div>
          </div>

          {/* Tier guide */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-7">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
              Not sure what do?
            </p>

            <div className="mt-7 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-400">
                We respond to all partnership enquiries within{" "}
                <strong className="text-gray-600">48 hours.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BecomeAPartner