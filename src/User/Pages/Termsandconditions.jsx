import { useState } from "react";
import { Helmet } from "react-helmet-async";

const BRAND = "CPNA Food Stuff";
const PHONE_DISPLAY = "+971 56 957 5751";
const PHONE_TEL = "+971569575751";
const WHATSAPP = "https://wa.me/971569575751";
const EMAIL = "Cpnafoodstuff@gmail.com";
const WEBSITE = "https://shop.cpnafoods.com";
const ADDRESS = "Al Aweer Vegetables & Fruits Market, Dubai, United Arab Emirates";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: `By accessing or using the ${BRAND} website or any of our services, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of our website and services immediately.

These terms apply to all visitors, buyers, exporters and business partners of ${BRAND}. We reserve the right to update these terms at any time, and continued use of our website or services constitutes acceptance of any revised terms.`,
  },
  {
    id: "about",
    title: `About ${BRAND}`,
    content: `${BRAND} is a fruits and vegetables importer and supplier based at the Al Aweer Vegetables & Fruits Market in Dubai, United Arab Emirates. We import fresh produce from India, mostly by air shipment and also by container, and supply it to buyers in the UAE.

We also welcome exporters who are looking for a genuine business partnership. Specific commercial terms with exporters and buyers are agreed in writing and may supplement these Terms & Conditions.`,
  },
  {
    id: "eligibility",
    title: "Eligibility & Account",
    content: `To do business with ${BRAND}, you must be at least 18 years of age and legally capable of entering into a binding contract, or act on behalf of a registered business. By contacting us, placing an order or creating an account, you represent that all information you provide is accurate, current, and complete.

If you have an account, you are responsible for keeping your login credentials confidential and for all activity under your account. Please notify us immediately of any unauthorized use. ${BRAND} shall not be liable for losses arising from unauthorized access caused by your failure to safeguard your login information.`,
  },
  {
    id: "orders",
    title: "Orders & Payments",
    content: `All orders are subject to availability and written or verbal confirmation by ${BRAND}. Because we deal in fresh imported produce, prices and availability can change with market conditions, season and shipment arrival. We reserve the right to cancel or refuse any order, including in cases of suspected fraud, inaccurate information, or pricing errors.

Prices, currency, payment method and payment terms are as stated in our quotation or invoice. Payment must be made in accordance with the terms agreed for each order.`,
  },
  {
    id: "delivery",
    title: "Shipment & Delivery",
    content: `${BRAND} strives to supply your order within the timeframe communicated at the time of confirmation. Delivery and shipment timelines may vary due to flight and container schedules, customs clearance, weather, product availability and public holidays.

Delivery arrangements, charges and pick-up options, if applicable, will be communicated before the order is confirmed. Risk of loss and title for products pass to you upon delivery or collection, unless otherwise agreed in writing.`,
  },
  {
    id: "returns",
    title: "Quality Claims & Refunds",
    content: `We want you to be satisfied with every purchase. If you receive damaged, spoiled or incorrect goods, please report it to us promptly, ideally within 24 hours of delivery, with photos and your order details.

As fresh fruits and vegetables are perishable, they are not eligible for return unless they arrive damaged, spoiled or not as described. Where a claim is approved, we will arrange a replacement, credit or refund, as agreed with you.`,
  },
  {
    id: "prohibited",
    title: "Prohibited Activities",
    content: `Users must not engage in any activity that disrupts, damages, or impairs our website or services. This includes but is not limited to: placing fraudulent orders, providing false business or shipment information, scraping or harvesting data without authorization, impersonating other users or ${BRAND} staff, uploading malicious content, or attempting to gain unauthorized access to our systems.

Violation of these prohibitions may result in immediate suspension of services and legal action where applicable.`,
  },
  {
    id: "ip",
    title: "Intellectual Property",
    content: `All content on the ${BRAND} website — including logos, text, images, graphics, and software — is the property of ${BRAND} or its licensors and is protected under applicable intellectual property laws.

You may not reproduce, distribute, modify, or create derivative works from any content on our website without prior written permission from ${BRAND}.`,
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    content: `Your privacy matters to us. ${BRAND} collects and processes personal data in accordance with our Privacy Policy. By using our website and services, you consent to the collection and use of your data as described therein.

We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, ${BRAND} shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of or inability to use our website or services, including delays caused by airlines, shipping lines, customs or other events beyond our control.

Our total liability for any claim arising in connection with these terms shall not exceed the amount paid by you for the specific order giving rise to the claim.`,
  },
  {
    id: "governing",
    title: "Governing Law",
    content: `These Terms & Conditions shall be governed by and construed in accordance with the laws applicable in the Emirate of Dubai and the federal laws of the United Arab Emirates. Any disputes arising out of or in connection with these terms shall be subject to the jurisdiction of the competent courts of Dubai, UAE.

If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `If you have any questions, concerns, or feedback regarding these Terms & Conditions, please reach out to us:

Email: ${EMAIL}
WhatsApp / Phone: ${PHONE_DISPLAY}
Website: cpnafoods.com
Address: ${ADDRESS}`,
  },
];

export default function TermsAndConditions() {
  const [activeId, setActiveId] = useState("acceptance");

  const handleScroll = (id) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const gradientStyle = {
    background:
      "radial-gradient(ellipse at 60% 40%, #4cdb65 0%, #22c55e 30%, #16a34a 60%, #15803d 100%)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <>
      <Helmet>
        <title>Terms & Conditions - CPNA Food Stuff | User Agreement</title>
        <meta name="description" content="Read the Terms & Conditions of CPNA Food Stuff, fruits & vegetables importer in the UAE." />
        <link rel="canonical" href={`${WEBSITE}/terms`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          .gk-font { font-family: 'DM Sans', sans-serif; }

          .hero-overlay::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
              radial-gradient(ellipse at 25% 60%, rgba(255,255,255,0.13) 0%, transparent 55%),
              radial-gradient(ellipse at 80% 10%, rgba(255,255,255,0.07) 0%, transparent 40%);
            pointer-events: none;
          }

          .gk-pill {
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.35);
            backdrop-filter: blur(4px);
          }

          .watermark {
            position: absolute;
            font-family: 'DM Sans', sans-serif;
            font-weight: 900;
            font-size: 6rem;
            color: rgba(255,255,255,0.08);
            line-height: 1;
            letter-spacing: -4px;
            user-select: none;
            pointer-events: none;
          }

          .sidebar-btn-active {
            background-color: #dcfce7;
            color: #15803d;
            font-weight: 700;
          }
          .sidebar-btn-inactive {
            color: #6b7280;
          }
          .sidebar-btn-inactive:hover {
            background-color: #f0fdf4;
            color: #15803d;
          }
        `}</style>

        {/* ── HERO ── */}
        <div className="w-full py-16 px-4 text-center hero-overlay gk-font" style={gradientStyle}>
          <span className="watermark" style={{ left: "24px", top: "50%", transform: "translateY(-50%)" }}>🌿</span>
          <span className="watermark" style={{ right: "24px", bottom: "-10px" }}>CPNA</span>

          <div className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 gk-pill">
            <span className="text-sm">🥭</span>
            <span className="text-xs font-semibold tracking-widest uppercase text-white">
              {BRAND} · Fresh Fruits & Vegetables
            </span>
          </div>

          <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-white mb-4 gk-font">
            Terms &amp;{" "}
            <span style={{ color: "#facc15" }}>Conditions</span>
          </h1>
          <p className="relative z-10 text-sm md:text-base max-w-lg mx-auto leading-relaxed gk-font" style={{ color: "rgba(255,255,255,0.85)" }}>
            Please read these terms carefully before using our website and services. By continuing, you agree to the following.
          </p>

          <div className="relative z-10 flex flex-wrap justify-center gap-6 mt-8 gk-font">
            {["📅 Last Updated: November 2026", "📄 Version 1.0"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8 gk-font">

          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <div className="lg:sticky lg:top-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div
                className="px-4 py-3"
                style={{
                  background: "radial-gradient(ellipse at 70% 50%, #22c55e 0%, #15803d 100%)",
                }}
              >
                <p className="text-xs font-bold tracking-widest uppercase text-white">
                  Table of Contents
                </p>
              </div>
              <div className="bg-white p-2">
                {sections.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleScroll(s.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 mb-0.5 text-xs leading-snug transition-colors ${
                      activeId === s.id ? "sidebar-btn-active" : "sidebar-btn-inactive"
                    }`}
                  >
                    {i + 1}. {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick contact in sidebar */}
            <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">Quick Contact</p>
              <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-2 text-xs text-gray-700 hover:text-green-700 mb-2">
                <span>📞</span> {PHONE_DISPLAY}
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-xs text-gray-700 hover:text-green-700 mb-2 break-all">
                <span>✉️</span> {EMAIL}
              </a>
              <p className="flex items-center gap-2 text-xs text-gray-500">
                <span>📍</span> Al Aweer Market, Dubai
              </p>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">

            {/* Notice banner */}
            <div className="rounded-2xl p-4 mb-8 flex gap-3" style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d" }}>
              <span className="text-xl shrink-0 mt-0.5">⚠️</span>
              <p className="text-sm leading-relaxed" style={{ color: "#92400e" }}>
                These Terms &amp; Conditions govern your use of the {BRAND} website and services. By placing an order or doing business with us, you legally agree to these terms. Questions? Email{" "}
                <strong>{EMAIL}</strong>
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-6"
                  style={{ transition: "box-shadow 0.2s" }}
                >
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                      style={{ background: "radial-gradient(ellipse at 60% 40%, #22c55e 0%, #15803d 100%)" }}
                    >
                      {index + 1}
                    </span>
                    <h2 className="font-bold text-gray-900 text-base">{section.title}</h2>
                  </div>

                  <div className="px-5 py-4">
                    {section.content.split("\n\n").map((para, i) => (
                      <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0 whitespace-pre-line break-words">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div
              className="mt-10 rounded-2xl p-8 text-center hero-overlay"
              style={gradientStyle}
            >
              <span className="watermark" style={{ right: "20px", bottom: "-10px", fontSize: "5rem" }}>🌾</span>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 gk-pill">
                  <span className="text-sm">🥦</span>
                  <span className="text-xs font-semibold tracking-widest uppercase text-white">
                    {BRAND} Promise
                  </span>
                </div>

                <h3 className="font-bold text-2xl mb-2 gk-font" style={{ color: "#ffffff" }}>
                  Fresh. Quality.{" "}
                  <span style={{ color: "#facc15" }}>Trusted.</span>
                </h3>
                <p className="text-sm max-w-md mx-auto leading-relaxed mb-6 gk-font" style={{ color: "rgba(255,255,255,0.85)" }}>
                  By doing business with {BRAND}, you trust us with your fresh produce needs. We promise to uphold quality, transparency, and fairness in everything we do.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="bg-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors hover:bg-yellow-50 gk-font"
                    style={{ color: "#15803d" }}
                  >
                    ✉️ {EMAIL}
                  </a>
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="border text-white font-semibold text-sm px-5 py-2.5 rounded-xl gk-font"
                    style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                  >
                    📞 {PHONE_DISPLAY}
                  </a>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border text-white font-semibold text-sm px-5 py-2.5 rounded-xl gk-font"
                    style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
                <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  📍 {ADDRESS}
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}