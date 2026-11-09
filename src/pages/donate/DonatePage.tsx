import { useState } from "react";
import { Heart, ArrowRight, Check, CreditCard, Phone, Mail, HelpCircle, Shield, ArrowLeft, ChevronDown, ChevronUp, Landmark, MapPin } from "lucide-react";
import oskLogoWhite from "@/assets/Logo/OSK-primary-logo-1200-400-white.svg";
import SEO from "@/components/SEO";
import { PAGE_SEO } from "@/config/seo";

// ─── Types ─────────────────────────────────────────────────────────────────
type Frequency = "monthly" | "one-time";
type Step = "amount" | "details" | "payment" | "success";
type PaymentMethod = "link" | "momo" | "bank";

// ─── Countries list ─────────────────────────────────────────────────────────
const COUNTRIES = [
  "Rwanda", "United States", "United Kingdom", "Canada", "Germany", "France", "Japan", "India", "Kenya", "Uganda", "Tanzania", "Burundi", "South Africa", "Nigeria",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Cambodia", "Cameroon", "Cape Verde", "Central African Rep", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Congo Democratic Rep",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "Gabon", "Gambia", "Georgia", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Jordan", "Kazakhstan", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Samoa", "San Marino", "Sao Tome & Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Ukraine",
  "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// ─── Preset amounts (USD ONLY) ─────────────────────────────────────────────
const AMOUNTS = [5, 10, 25, 50, 100, 250];



// ─── Collapsible FAQ Categories & Expanded Data ─────────────────────────────
interface FAQCategory {
  title: string;
  items: { question: string; answer: string | React.ReactNode }[];
}

const FAQS: FAQCategory[] = [
  {
    title: "How to Support",
    items: [
      {
        question: "What are the ways I can donate?",
        answer: (
          <span>
            We offer multiple ways to support us! You can donate online securely using <strong>Link</strong> (for fast global card checkouts), 
            <strong>Mobile Money (MTN & Airtel)</strong> for local quick transfers, or via <strong>Direct Bank Transfer</strong>. 
            If you need custom billing or receipt arrangements for corporate donations, feel free to email our team directly.
          </span>
        ),
      },
    ],
  },
  {
    title: "Managing Your Donation",
    items: [
      {
        question: "Can I cancel or change my monthly donation?",
        answer: "Yes. If you choose a recurring monthly donation, you can request modifications, upgrades, or cancellations at any time by dropping a line to our support email contact@oskigali.org. We process cancellations immediately with no hidden fees.",
      },
      {
        question: "Will I get a receipt for my donation?",
        answer: "Definitely. Once your donation transaction goes through, an automatic transactional receipt is instantly generated and delivered to the email address you specified during the details step.",
      },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      {
        question: "Is my payment secure?",
        answer: "Security is our highest priority. All card transactions are routed directly through Link's PCI-DSS compliant secure vaults, and Mobile Money collections are processed using fully encrypted APIs. Open Source Kigali does not log, inspect, or retain any bank card details or Mobile Money PINs.",
      },
      {
        question: "How do you handle my personal data?",
        answer: "We only request your name, email address, and billing address to record contributor appreciation listings and to dispatch receipts. Your details are never traded, leased, or distributed to advertising networks or external partners.",
      },
    ],
  },
  {
    title: "Financial Transparency",
    items: [
      {
        question: "Where do my donations go?",
        answer: "100% of collected community funds are reinvested back into supporting active development. This includes maintaining cloud database hosting platforms, provisioning tools/IDE subscriptions for student contributors, purchasing workshop training equipment, and arranging refreshments/wifi for physical developer meetups.",
      },
    ],
  },
  {
    title: "How to Get Further Support",
    items: [
      {
        question: "Who can I contact if I have payment issues?",
        answer: (
          <span>
            For immediate help with donation issues or to organize corporate sponsorships, you can write directly to our core team at{" "}
            <a href="mailto:contact@oskigali.org" className="text-primary-colour underline font-semibold">
              contact@oskigali.org
            </a>.
          </span>
        ),
      },
    ],
  },
];

const DonatePage = () => {
  // Page / Card state
  const [step, setStep] = useState<Step>("amount");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [selected, setSelected] = useState<number>(10);
  const [custom, setCustom] = useState<string>("");
  
  // Details form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("link");

  // Address form state
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("Kigali");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Rwanda");

  // Payment form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankReference, setBankReference] = useState("");
  const [linkEmail, setLinkEmail] = useState("");

  // Accordion State
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({
    0: true, // Expand "How to Support" by default
  });
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const toggleCategory = (index: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const displayAmount = custom ? Number(custom) : selected;
  const isDetailsValid = name && email && streetAddress && city && stateRegion && zipCode && country;

  const handleNextStep = () => {
    if (step === "amount") {
      if (!displayAmount || displayAmount <= 0) return;
      setStep("details");
    } else if (step === "details") {
      if (!isDetailsValid) return;
      setStep("payment");
    } else if (step === "payment") {
      if (paymentMethod === "momo" && !phoneNumber) return;
      if (paymentMethod === "bank" && !bankReference) return;
      if (paymentMethod === "link" && !linkEmail) return;
      setStep("success");
    }
  };

  const handleBackStep = () => {
    if (step === "details") setStep("amount");
    if (step === "payment") setStep("details");
  };

  const resetFlow = () => {
    setStep("amount");
    setSelected(10);
    setCustom("");
    setName("");
    setEmail("");
    setStreetAddress("");
    setApartment("");
    setCity("");
    setStateRegion("Kigali");
    setZipCode("");
    setCountry("Rwanda");
    setPhoneNumber("");
    setBankReference("");
    setLinkEmail("");
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e" }}>
      <SEO {...PAGE_SEO.donate} />
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pt-32 pb-20 px-4 text-center"
        style={{
          background: "linear-gradient(180deg, #0d1b3e 0%, #0a0f1e 100%)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(11,163,223,0.15) 0%, transparent 70%)",
          }}
        />

        <img
          src={oskLogoWhite}
          alt="Open Source Kigali"
          className="h-10 mx-auto mb-8 opacity-90"
        />

        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
          <Heart size={12} className="text-[#0ba3df] fill-[#0ba3df]" />
          <span className="text-white/70 text-xs tracking-widest uppercase">
            Support the mission
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-3xl mx-auto">
          Help keep open source <span className="text-primary-colour">alive in Rwanda</span>
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
          Open Source Kigali is 100% community-powered. Your donation directly
          funds workshops, contributor tools, and events shaping the next
          generation of tech builders.
        </p>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 pb-24 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "1,500+", label: "Contributors" },
            { value: "30+", label: "Events" },
            { value: "100%", label: "Open source" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/4 p-4 text-center"
            >
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Interactive Donation card ─────────────────────────────────── */}
        <div>
          <div
            className="rounded-2xl border border-white/10 overflow-hidden sticky top-28"
            style={{
              background: "#111827",
              boxShadow: "0 0 0 1px rgba(11,163,223,0.12), 0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Card header */}
            <div className="px-8 py-6 border-b border-white/8 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-2xl">Make a donation</p>
                <p className="text-gray-500 text-sm mt-1">
                  {step === "amount" && "Secure · Transparent · Community-driven"}
                  {step === "details" && "Step 2 of 3: Contributor details"}
                  {step === "payment" && "Step 3 of 3: Payment details"}
                  {step === "success" && "Transaction completed"}
                </p>
              </div>
              {step !== "amount" && step !== "success" && (
                <button
                  onClick={handleBackStep}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            <div className="px-8 py-7 space-y-7">
              {/* ── STEP 1: Select Amount ── */}
              {step === "amount" && (
                <>
                  {/* Frequency Selector */}
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                      Donation frequency
                    </p>
                    <div className="flex gap-2 p-1 rounded-full bg-white/5 border border-white/10 w-fit">
                      {(["monthly", "one-time"] as Frequency[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFrequency(f)}
                          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                            frequency === f
                              ? "bg-primary-colour text-white shadow-lg"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {f === "monthly" ? "Monthly" : "One-time"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {frequency === "monthly" && (
                    <p className="text-primary-colour text-xs flex items-center gap-1.5">
                      <Check size={11} />
                      Monthly donors keep our programs running year-round
                    </p>
                  )}

                  {/* Preset amounts grid */}
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                      Select amount (USD)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            setSelected(amt);
                            setCustom("");
                          }}
                          className={`py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                            selected === amt && !custom
                              ? "bg-primary-colour border-primary-colour text-white scale-[1.04]"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-primary-colour hover:text-white"
                          }`}
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom amount */}
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                      Or enter your amount
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Other amount"
                        value={custom}
                        onChange={(e) => {
                          setCustom(e.target.value);
                          setSelected(0);
                        }}
                        className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-colour transition-colors"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-primary-colour/10 border border-primary-colour/20">
                    <div>
                      <p className="text-gray-400 text-xs">Your donation</p>
                      <p className="text-white font-bold text-lg">
                        ${displayAmount ? displayAmount.toLocaleString() : "—"}
                        {frequency === "monthly" ? (
                          <span className="text-gray-400 text-sm font-normal ml-1">/month</span>
                        ) : null}
                      </p>
                    </div>
                    <Heart size={22} className="text-primary-colour fill-primary-colour" />
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!displayAmount || displayAmount <= 0}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-primary-colour hover:bg-[#0993c9] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    ❤️ Donate ${displayAmount ? displayAmount.toLocaleString() : "—"}{frequency === "monthly" ? "/mo" : ""}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* ── STEP 2: Contributor Details & Address ── */}
              {step === "details" && (
                <div className="space-y-5 max-h-[460px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-colour transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="johndoe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-colour transition-colors"
                    />
                  </div>

                  {/* Stripe-style Address Module */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={12} className="text-primary-colour" /> Enter your address
                    </label>
                    
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/3">
                      <input
                        type="text"
                        placeholder="Street address"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-600 text-sm border-b border-white/5 focus:outline-none focus:bg-white/5 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Apartment / suite / floor"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-600 text-sm border-b border-white/5 focus:outline-none focus:bg-white/5 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-600 text-sm border-b border-white/5 focus:outline-none focus:bg-white/5 transition-colors"
                      />
                      
                      <div className="grid grid-cols-2 border-b border-white/5">
                        <input
                          type="text"
                          placeholder="State"
                          value={stateRegion}
                          onChange={(e) => setStateRegion(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-600 text-sm border-r border-white/5 focus:outline-none focus:bg-white/5 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="Zip code"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none focus:bg-white/5 transition-colors"
                        />
                      </div>

                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-white text-sm focus:outline-none focus:bg-white/5 transition-colors cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} className="bg-[#111827] text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                      Select Payment Channel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod("link")}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          paymentMethod === "link"
                            ? "bg-primary-colour border-primary-colour text-white scale-[1.02]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-primary-colour hover:text-white"
                        }`}
                      >
                        <CreditCard size={16} /> Link (Card)
                      </button>
                      <button
                        onClick={() => setPaymentMethod("momo")}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          paymentMethod === "momo"
                            ? "bg-primary-colour border-primary-colour text-white scale-[1.02]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-primary-colour hover:text-white"
                        }`}
                      >
                        <Phone size={16} /> Mobile Money
                      </button>
                      <button
                        onClick={() => setPaymentMethod("bank")}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          paymentMethod === "bank"
                            ? "bg-primary-colour border-primary-colour text-white scale-[1.02]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-primary-colour hover:text-white"
                        }`}
                      >
                        <Landmark size={16} /> Bank Transfer
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!isDetailsValid}
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-primary-colour hover:bg-[#0993c9] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group mt-6"
                  >
                    ❤️ Continue to Payment
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {/* ── STEP 3: Payment details input ── */}
              {step === "payment" && (
                <div className="space-y-5">
                  <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Charging Amount:</span>
                    <span className="text-white font-bold">
                      ${displayAmount.toLocaleString()} 
                    </span>
                  </div>

                  {paymentMethod === "link" && (
                    <div className="space-y-4">
                      {/* Django-style green "Pay with link" button */}
                      <button
                        onClick={() => {
                          setLinkEmail(email);
                          setStep("success");
                        }}
                        className="w-full py-3.5 rounded-xl bg-[#00d66f] hover:bg-[#00c265] text-black font-extrabold text-base flex items-center justify-center gap-1.5 shadow transition-all"
                      >
                        Pay with <span className="underline decoration-2">link</span>
                      </button>
                      
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or pay manually</span>
                        <div className="flex-grow border-t border-white/10"></div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                          Card Email
                        </label>
                        <input
                          type="email"
                          placeholder="johndoe@example.com"
                          value={linkEmail}
                          onChange={(e) => setLinkEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-colour transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "momo" && (
                    <div>
                      <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                        Mobile Money Phone Number (MTN / Airtel)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                          +250
                        </span>
                        <input
                          type="tel"
                          placeholder="788000000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-16 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-colour transition-colors"
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        You will receive an automatic prompt on your MTN or Airtel line to authorize the payment.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                        <p className="text-gray-400 uppercase tracking-widest font-bold">OSK Bank Account Info</p>
                        <p className="text-white"><span className="text-gray-400">Bank:</span> I&M Bank Rwanda</p>
                        <p className="text-white"><span className="text-gray-400">Account Name:</span> Open Source Kigali</p>
                        <p className="text-white"><span className="text-gray-400">Account Number:</span> 001-0293847-01</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                          Bank Transfer Transaction ID / Reference
                        </label>
                        <input
                          type="text"
                          placeholder="TXN1293847"
                          value={bankReference}
                          onChange={(e) => setBankReference(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-colour transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleNextStep}
                    disabled={
                      (paymentMethod === "momo" && !phoneNumber) ||
                      (paymentMethod === "bank" && !bankReference) ||
                      (paymentMethod === "link" && !linkEmail)
                    }
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-primary-colour hover:bg-[#0993c9] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
                  >
                    ❤️ Pay ${displayAmount.toLocaleString()}
                  </button>
                </div>
              )}

              {/* ── STEP 4: Success Message ── */}
              {step === "success" && (
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                    <Check size={32} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Thank you, {name} !</h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                      Your contribution of <span className="text-white font-semibold">${displayAmount.toLocaleString()}</span> to Open Source Kigali has been registered successfully.
                    </p>
                  </div>
                  <button
                    onClick={resetFlow}
                    className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all duration-200"
                  >
                    Make another donation
                  </button>
                </div>
              )}

              {/* Security signals (bottom) */}
              <div className="flex items-center justify-center gap-6 pt-1">
                {["Secure payment", "Cancel anytime", "Tax-deductible"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Check size={11} className="text-green-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Collapsible FAQ & Resources section ─────────────────────────── */}
      <section className="border-t border-white/10 py-20 px-4" style={{ background: "#0a0f1e" }}>
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* FAQ Accordion categories */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-3xl mb-8 flex items-center gap-2">
              <HelpCircle size={24} className="text-primary-colour" /> Donation Help & FAQ
            </h3>
            
            <div className="space-y-4">
              {FAQS.map((category, catIndex) => {
                const isOpen = !!openCategories[catIndex];
                return (
                  <div
                    key={category.title}
                    className="rounded-xl border border-white/10 bg-white/3 overflow-hidden transition-all duration-300"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(catIndex)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left text-white hover:bg-white/5 transition-colors"
                    >
                      <span className="font-bold text-lg tracking-wide">{category.title}</span>
                      {isOpen ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </button>

                    {/* Collapsible Category Content */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 divide-y divide-white/5 space-y-5">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="pt-4 first:pt-0">
                            <h5 className="text-white font-semibold text-sm mb-2">
                              {item.question}
                            </h5>
                            <div className="text-gray-400 text-xs leading-relaxed space-y-2">
                              {item.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inline Privacy Policy Accordion */}
          <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden transition-all duration-300">
            <button
              onClick={() => setPrivacyOpen(!privacyOpen)}
              className="w-full px-6 py-5 flex items-center justify-between text-left text-white hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-lg tracking-wide flex items-center gap-2">
                <Shield size={20} className="text-primary-colour" /> Read our Privacy Policy
              </span>
              {privacyOpen ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </button>
            
            {privacyOpen && (
              <div className="px-6 pb-6 pt-2 text-gray-400 text-xs space-y-4 leading-relaxed">
                <p>
                  <strong>Open Source Kigali Community Privacy Pledge</strong>
                </p>
                <p>
                  We are fully committed to protecting the privacy of our contributors and sponsors. Here is how your information is handled:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Payment Credentials:</strong> We never collect, cache, or store your mobile money PINs, card expiration dates, security codes, or account passwords. All billing actions are handled off-site by fully authorized financial gateways.</li>
                  <li><strong>Donor Information:</strong> We store your name, email address, and billing address securely to match receipt delivery targets. This data is not traded, sold, or shared with third-party tracking corporations.</li>
                  <li><strong>Security:</strong> All browser-to-server data transmission uses high-grade HTTPS encryption protocols to prevent tracking.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Contact Us Directly (Core Email instead of Whatsapp button) */}
          <div className="pt-6">
            <div className="rounded-xl border border-white/5 bg-white/3 p-6 space-y-4 text-center max-w-lg mx-auto">
              <h3 className="text-white font-bold text-lg flex items-center justify-center gap-2">
                <Mail size={18} className="text-primary-colour" /> Contact Us Directly
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Have questions about donations, corporate partnerships, or community events? Write to us directly.
              </p>
              <a
                href="mailto:contact@oskigali.org"
                className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary-colour hover:bg-[#0993c9] text-white text-sm font-bold transition-all duration-200 hover:scale-105"
              >
                Email Core Team <ArrowRight size={14} className="ml-2" />
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default DonatePage;
