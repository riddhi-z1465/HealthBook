import { useEffect } from "react";
import { Link } from "react-router-dom";
import { services as serviceData } from "../assets/data/services";

const Services = () => {
  useEffect(() => {
    const observed = document.querySelectorAll(".reveal-on-scroll");
    if (!observed.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observed.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const carePrograms = [
    {
      title: "Preventive Care",
      subtitle: "Annual & lifestyle clinics",
      description:
        "Deep wellness visits that combine lab work, lifestyle coaching, and screening plans tailored to your goals.",
      icon: "🩺",
      accent: "from-emerald-400/25 to-emerald-100"
    },
    {
      title: "Chronic Care",
      subtitle: "End-to-end disease management",
      description:
        "Integrated nurse navigators, medication support, and digital monitoring keep conditions stable and predictable.",
      icon: "📈",
      accent: "from-blue-400/25 to-blue-100"
    },
    {
      title: "Family & Pediatrics",
      subtitle: "Multi-age family plans",
      description:
        "Coordinated pediatric and adult visits, vaccination drives, and developmental tracking for every age.",
      icon: "👨‍👩‍👧",
      accent: "from-amber-400/25 to-amber-100"
    }
  ];

  const specialtySteps = [
    {
      title: "Real-time appointment search",
      desc: "Filter doctors by specialty, insurance, or distance and see live availability instantly.",
      icon: (
        <svg
          className="w-12 h-12 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
            d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Care coordination",
      desc: "Our concierge team syncs referrals, lab orders, and imaging so every visit builds on the previous.",
      icon: (
        <svg
          className="w-12 h-12 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Always-on follow ups",
      desc: "Secure messaging, reminders, and symptom trackers keep you connected between visits.",
      icon: (
        <svg
          className="w-12 h-12 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
    },
  ];

  const featuredSpecialties = [
    "Cardiology",
    "Orthopedics",
    "Neurology",
    "Dermatology",
    "Women's Health",
    "Mental Health",
    "Gastroenterology",
    "Endocrinology",
    "Pulmonology",
    "Oncology"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f2fffb] via-white to-[#d7f5ed] py-24">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-6 reveal-on-scroll">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">
                care catalog
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                Every service your family needs, wrapped into one intuitive platform.
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Compare programs, explore specialties, and book with confidence. HealthBook keeps each step cohesive—from first symptom check to long-term recovery.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_20px_50px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition"
                >
                  Find a Specialist
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-600 transition"
                >
                  Talk to Care Team
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6">
                {["50+ specialties", "24/7 nurse line", "Same-day labs"].map(stat => (
                  <div key={stat} className="rounded-2xl border border-white/60 bg-white/90 p-4 text-center shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
                    <p className="text-sm font-semibold text-emerald-500 tracking-wide uppercase">{stat.split(" ")[0]}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.split(" ").slice(1).join(" ")}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-on-scroll">
              <div className="relative rounded-[32px] bg-white p-6 shadow-[0_35px_120px_rgba(15,23,42,0.15)]">
                <div className="rounded-[26px] bg-slate-900/95 text-white p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Care bundle</p>
                      <p className="text-2xl font-semibold">Total Wellness Plus</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-semibold text-emerald-100">
                      Save 25%
                    </span>
                  </div>
                  <div className="space-y-4 text-sm">
                    {[
                      "Unlimited primary care & telehealth",
                      "Specialist navigation & referrals",
                      "Lab credits + imaging concierge",
                      "Pharmacy sync + medication coaching"
                    ].map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-white text-slate-900 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Starting at</p>
                    <p className="text-3xl font-semibold">$79/mo</p>
                    <p className="text-sm text-slate-500">Flexible employer & family plans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section id="services" className="py-20 bg-white reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">flagship services</p>
            <h2 className="text-4xl font-bold text-slate-900">Designed around outcomes, not appointments.</h2>
            <p className="text-lg text-slate-500">
              From urgent needs to long-term therapy, each program blends in-person expertise with always-on digital support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceData.map(service => (
              <div
                key={service.name}
                className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.07)] backdrop-blur hover:-translate-y-1 transition"
              >
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                  style={{ backgroundColor: service.bgColor, color: service.textColor }}
                >
                  •
                </span>
                <h3 className="mt-6 text-2xl font-semibold text-slate-900">{service.name}</h3>
                <p className="mt-3 text-slate-500">{service.desc}</p>
                <button className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-600">
                  Explore service
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care programs */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white reveal-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">care programs</p>
              <h2 className="text-4xl font-bold leading-tight">Choose a guided program and we assemble the team.</h2>
            </div>
            <p className="text-lg text-white/70 max-w-xl">
              Each program includes a lead physician, care coordinator, personalized content, and proactive milestones to keep you on track.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {carePrograms.map(program => (
              <div key={program.title} className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${program.accent}`}>
                  <span className="text-2xl">{program.icon}</span>
                </div>
                <p className="mt-4 text-sm uppercase tracking-[0.3em] text-white/60">{program.subtitle}</p>
                <h3 className="text-2xl font-semibold mt-2">{program.title}</h3>
                <p className="mt-3 text-white/70">{program.description}</p>
                <button className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-200">
                  View details <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-slate-50 reveal-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">how it works</p>
            <h2 className="text-4xl font-bold text-slate-900">A clear path from first symptom to recovery.</h2>
            <p className="text-lg text-slate-500">
              Every step is synced across clinicians and surfaced inside your HealthBook timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialtySteps.map((step, index) => (
              <div key={step.title} className="relative rounded-3xl bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.07)] border border-slate-100">
                <span className="absolute -top-4 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold">
                  0{index + 1}
                </span>
                <span className="text-3xl">{step.icon}</span>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialty grid & CTA */}
      <section className="py-20 bg-white reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">specialties</p>
            <h2 className="text-4xl font-bold text-slate-900">Deep benches in every discipline.</h2>
            <p className="text-lg text-slate-500">
              Expert teams across surgery, diagnostics, and rehab partner through shared records and multidisciplinary boards.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {featuredSpecialties.map(item => (
                <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-10 shadow-[0_35px_80px_rgba(13,148,136,0.35)] flex flex-col gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">need guidance?</p>
              <h3 className="text-3xl font-semibold">Let our care guides build your plan.</h3>
              <p className="mt-3 text-white/80">
                Upload referrals, insurance cards, or previous records and we configure the right mix of clinicians in under 24 hours.
              </p>
            </div>
            <div className="space-y-3 text-white/80 text-sm">
              <p>✓ Dedicated concierge & chat</p>
              <p>✓ Personalized treatment roadmap</p>
              <p>✓ Transparent pricing & coverage help</p>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 font-semibold text-emerald-600"
              >
                Get started now
              </Link>
              <Link to="/contact" className="text-center font-semibold text-white/90 underline underline-offset-4">
                Or schedule a discovery call →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
