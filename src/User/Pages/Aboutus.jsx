import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

const BRAND = "CPNA Food Stuff";
const PHONE_DISPLAY = "+971 56 957 5751";
const PHONE_TEL = "+971569575751";
const WHATSAPP = "https://wa.me/971569575751";
const EMAIL = "Cpnafoodstuff@gmail.com";
const WEBSITE = "https://shop.cpnafoods.com";
const ADDRESS_LINE1 = "Al Aweer Vegetables & Fruits Market";
const ADDRESS_LINE2 = "Dubai, United Arab Emirates";

const highlights = [
  { value: "India → UAE", label: "Direct Import" },
  { value: "Air + Container", label: "Shipment Modes" },
  { value: "Fresh Produce", label: "Fruits & Vegetables" },
  { value: "Always Open", label: "Reach Us Anytime" },
];

const values = [
  {
    icon: "🍎",
    title: "Fresh",
    desc: "Fruits and vegetables imported from India, with air shipment for quick delivery so produce reaches the UAE market fresh.",
  },
  {
    icon: "✅",
    title: "Quality",
    desc: "We care about what we supply. Every consignment is chosen to meet the quality UAE buyers expect.",
  },
  {
    icon: "🤝",
    title: "Trusted",
    desc: "Honest dealings and long-term relationships with exporters in India and buyers in the UAE.",
  },
  {
    icon: "🚢",
    title: "Air & Container Shipping",
    desc: "Most of our imports come by air shipment, and we also bring in full containers for larger volumes.",
  },
];

const steps = [
  { tag: "Step 1", text: "Partner with genuine exporters in India" },
  { tag: "Step 2", text: "Ship by air or container, depending on the product" },
  { tag: "Step 3", text: "Receive and supply at Al Aweer Market, Dubai" },
  { tag: "Step 4", text: "Deliver fresh produce to UAE buyers" },
];

export default function AboutUs() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us - {BRAND} | Fruits & Vegetables Importer in UAE</title>
        <meta
          name="description"
          content="CPNA Food Stuff imports fresh fruits & vegetables from India to the UAE by air and container. Based at Al Aweer Market, Dubai. Exporters welcome for business partnership."
        />
        <link rel="canonical" href={`${WEBSITE}/about`} />
      </Helmet>

      <div className="min-h-screen bg-[#fafaf7] font-sans text-gray-800">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-10 text-8xl">🥭</div>
            <div className="absolute bottom-10 right-10 text-8xl">🥦</div>
            <div className="absolute top-1/2 left-1/3 text-6xl">🍅</div>
          </div>
          <div
            className={`relative max-w-4xl mx-auto px-6 py-24 text-center transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-5">
              Al Aweer Market · Dubai, UAE
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 drop-shadow">
              India's Finest Fruits & Vegetables,
              <br />
              <span className="text-yellow-300">Delivered to the UAE</span>
            </h1>
            <p className="text-lg text-green-100 max-w-xl mx-auto leading-relaxed">
              Fresh • Quality • Trusted. {BRAND} is a fruits & vegetables supplier in the UAE, importing directly from India by air and container.
            </p>
          </div>
        </section>

        {/* Highlights */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl md:text-2xl font-extrabold text-green-700">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who We Are */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-600">Who We Are</span>
              <h2 className="text-3xl font-extrabold mt-2 mb-5 text-gray-800 leading-snug">
                A Bridge Between <span className="text-green-600">Indian Farms & UAE Markets</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {BRAND} imports fruits and vegetables from India and supplies them in the UAE. Most of our produce arrives by air shipment, and we also bring in containers for bulk orders.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are based at the Al Aweer Vegetables & Fruits Market in Dubai, right where the UAE's fresh produce trade happens.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our promise is simple: fresh, good-quality produce from people you can trust.
              </p>
            </div>

            {/* How we work */}
            <div className="md:w-1/2 w-full">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8">
                <p className="text-sm font-bold text-green-700 mb-5 uppercase tracking-wide">How We Work</p>
                <div className="space-y-5">
                  {steps.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="min-w-[64px] text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded text-center mt-0.5">
                        {item.tag}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-green-600">What We Stand For</span>
              <h2 className="text-3xl font-extrabold mt-2 text-gray-800">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300 bg-white"
                >
                  <div className="text-3xl mt-1">{v.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exporter Partnership */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8 md:p-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Partner With Us</span>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-2 mb-4 text-gray-800">
              Are You an Exporter in India?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
              We are looking for exporters who want a real business partnership. If you export fruits or vegetables and want a dependable buyer in the UAE, get in touch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Chat on WhatsApp
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-block bg-white border border-green-300 text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Send an Email
              </a>
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Get in Touch</span>
            <h2 className="text-3xl font-extrabold mt-2 text-gray-800">Contact Us</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-md mx-auto">
              Questions, orders or partnership enquiries — we'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone */}
            <a
              href={`tel:${PHONE_TEL}`}
              className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300 bg-white group"
            >
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl group-hover:bg-green-200 transition-colors">
                📞
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Call / WhatsApp</p>
                <p className="font-bold text-gray-800">{PHONE_DISPLAY}</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300 bg-white group"
            >
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl group-hover:bg-green-200 transition-colors">
                ✉️
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-0.5">Email Us</p>
                <p className="font-bold text-gray-800 break-all">{EMAIL}</p>
              </div>
            </a>

            {/* Website */}
            <a
              href={WEBSITE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300 bg-white group"
            >
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl group-hover:bg-green-200 transition-colors">
                🌐
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Website</p>
                <p className="font-bold text-gray-800">cpnafoods.com</p>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 bg-white">
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl">
                📍
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Our Location</p>
                <p className="font-bold text-gray-800 leading-snug">
                  {ADDRESS_LINE1},<br />
                  {ADDRESS_LINE2}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-green-700 text-white">
          <div className="max-w-4xl mx-auto px-6 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
              Fresh • Quality • Trusted 🌿
            </h2>
            <p className="text-green-200 text-base">
              Your reliable fruits & vegetables supplier in the UAE.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}