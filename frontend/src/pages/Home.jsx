import { Link } from "react-router-dom";
import { useEffect } from "react";
import { HiStar } from "react-icons/hi";
import { BsArrowUpRight } from "react-icons/bs";
import doctorTeam from "../assets/images/DoctorTeamImage.png";
import doctorTeamHero from "../assets/images/DoctorTeam.png";
import heroFallback from "../assets/images/hero-img01.png";
import expressTeam from "../assets/images/express-team.jpg";

const Home = () => {


    // Service icon components
    const ServiceIcon = ({ type }) => {
        const icons = {
            adult: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            child: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            home: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            surgery: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            ultrasound: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
            ),
            xray: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            diagnostic: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            medical: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        };
        return icons[type] || icons.adult;
    };

    const services = [
        {
            iconType: "adult",
            title: "Adult Reception",
            subtitle: "Consultation",
            description: "Comprehensive general health checkups and consultations for adults, focusing on preventive care and disease management.",
            doctorCount: "25"
        },
        {
            iconType: "child",
            title: "Children's Reception",
            subtitle: "Pediatrics",
            description: "Specialized pediatric care ensuring the physical, mental, and social health of children from birth through adolescence.",
            doctorCount: "18"
        },
        {
            iconType: "home",
            title: "Home Visit",
            subtitle: "Doctor at home",
            description: "Convenient medical care delivered right to your doorstep for patients who cannot visit the clinic due to illness or mobility.",
            doctorCount: "12"
        },
        {
            iconType: "surgery",
            title: "Operational Block",
            subtitle: "Surgery",
            description: "State-of-the-art surgical facilities equipped for a wide range of procedures, ensuring patient safety and surgical precision.",
            doctorCount: "15"
        },
        {
            iconType: "ultrasound",
            title: "Ultrasound Diagnostics",
            subtitle: "Examination",
            description: "High-resolution ultrasound imaging for accurate diagnosis of internal conditions, safe for women and all patient groups.",
            doctorCount: "8"
        },
        {
            iconType: "xray",
            title: "X-ray Cabinet",
            subtitle: "Diagnostics",
            description: "Advanced digital X-ray services providing quick and clear imaging for bone fractures, chest infections, and dental issues.",
            doctorCount: "6"
        },
        {
            iconType: "diagnostic",
            title: "Functional Diagnostics",
            subtitle: "Analysis",
            description: "Comprehensive testing to assess the physiological function of organs like the heart, lungs, and nervous system.",
            doctorCount: "10"
        },
        {
            iconType: "medical",
            title: "Medical Services",
            subtitle: "At home",
            description: "A wide range of general medical services including vaccinations, wound care, health screenings, and routine monitoring.",
            doctorCount: "20"
        },
    ];

    const doctors = [
        {
            name: "Dr. Alfaz Ahmed",
            specialty: "Surgeon",
            experience: "15+ years",
            rating: 4.8,
            image: "👨‍⚕️",
        },
        {
            name: "Dr. Saleh Mahmud",
            specialty: "Neurologist",
            experience: "12+ years",
            rating: 4.9,
            image: "👨‍⚕️",
        },
        {
            name: "Dr. Farid Uddin",
            specialty: "Dermatologist",
            experience: "10+ years",
            rating: 4.7,
            image: "👩‍⚕️",
        },
        {
            name: "Dr. Sarah Johnson",
            specialty: "Pediatrician",
            experience: "8+ years",
            rating: 4.9,
            image: "👩‍⚕️",
        },
    ];

    const heroSrc = import.meta.env.VITE_HERO_IMAGE || doctorTeam;

    useEffect(() => {
        const observed = document.querySelectorAll(".reveal-on-scroll");
        if (!observed.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        observed.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#f7fbff] via-white to-[#e3f5f3] py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 animate-rise">
                            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 shadow-sm animate-rise">
                                <span className="h-2 w-2 rounded-full bg-amber-400" />
                                Medical center for everyone
                            </span>

                            <div className="space-y-4 animate-rise animate-delay-1">
                                <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
                                    Book doctor appointments effortlessly{" "}
                                    <span className="text-transparent bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text">
                                        for your family
                                    </span>
                                </h1>
                                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                                    A trusted healthcare platform connecting patients and doctors through secure booking, digital records, and coordinated clinic management—so care feels simple.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 animate-rise animate-delay-2">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_18px_35px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 hover:bg-emerald-700 transition-transform"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/doctors"
                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition"
                                >
                                    Find Doctors →
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur animate-rise animate-delay-2">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">Trusted specialists</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {["teal", "violet", "amber"].map((color, idx) => (
                                                <div key={color} className={`h-10 w-10 rounded-full border-2 border-white bg-${color}-100 flex items-center justify-center animate-rise`} style={{ animationDelay: `${0.2 * (idx + 1)}s` }}>
                                                    <svg className={`h-5 w-5 text-${color}-600`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-3xl font-semibold text-slate-900">+68</p>
                                            <p className="text-sm text-slate-500">Professional doctors with experience</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-inner animate-rise animate-delay-3">
                                    <p className="text-sm font-semibold text-emerald-700">Same-day appointments</p>
                                    <p className="text-2xl font-bold text-emerald-900 mt-1">24/7</p>
                                    <p className="text-xs text-emerald-700/80">support team on standby</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Hero Image */}
                        <div className="relative animate-rise animate-delay-2">
                            <div className="relative rounded-[36px] bg-white p-3 shadow-[0_35px_80px_rgba(15,23,42,0.15)]">
                                <div className="rounded-[28px] border-4 border-teal-100 bg-gradient-to-br from-teal-400 to-cyan-500 p-4">
                                    <div className="rounded-[22px] bg-white p-2 animate-float-slow">
                                        <img
                                            src={doctorTeamHero}
                                            alt="Doctor team"
                                            className="rounded-[18px] w-full object-cover shadow-2xl"
                                            loading="eager"
                                            onError={(e) => { e.currentTarget.src = heroFallback; }}
                                        />
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-11/12 rounded-3xl bg-white/90 px-5 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur">
                                    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">Patient rating</p>
                                            <p className="text-lg text-slate-900">4.9/5</p>
                                        </div>
                                        <div className="h-10 w-px bg-slate-200" />
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">Appointments</p>
                                            <p className="text-lg text-slate-900">12k+</p>
                                        </div>
                                        <div className="h-10 w-px bg-slate-200" />
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">Clinics</p>
                                            <p className="text-lg text-slate-900">48</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-24">
                        <div className="rounded-3xl bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] border border-slate-100 animate-rise">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Healthcare for every stage of life</h3>
                                    <p className="text-slate-500">
                                        From routine checkups to specialist care, we support individuals and families with reliable medical services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-lime-100/80 p-6 shadow-[0_20px_50px_rgba(132,204,22,0.35)] border border-lime-200 animate-rise animate-delay-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Check-up list by directions</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm font-medium text-slate-600">
                                {["Gastroenterology", "Cardiology", "Pediatrics", "Endocrinology", "Gynecology", "Immunology"].map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <button className="mt-5 inline-flex items-center gap-2 text-emerald-700 font-semibold">
                                Learn more →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-gradient-to-b from-white to-slate-50/70 reveal-on-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Services
                        </span>
                        <div className="flex flex-wrap items-end gap-6">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-bold text-slate-900 leading-tight">Wide range of services</h2>
                                <p className="text-slate-500 text-lg max-w-2xl">
                                    From preventive screenings to complex procedures, HealthBook brings every essential specialty into one calm hub.
                                </p>
                            </div>
                            <div className="h-12 w-px bg-slate-200 hidden lg:block" />
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                24/7 nurse hotline • Same-day appointments
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-[30px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                            >
                                {/* Faint Background Icon */}
                                <div className="absolute -right-4 -top-4 opacity-[0.03] transition-transform group-hover:scale-110">
                                    <div className="scale-[2.5]">
                                        <ServiceIcon type={service.iconType} />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="relative z-10">
                                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                                        <ServiceIcon type={service.iconType} />
                                    </div>

                                    <h3 className="mb-3 text-xl font-bold text-slate-900">{service.title}</h3>

                                    <p className="mb-10 text-sm leading-relaxed text-slate-500">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                                        <span>{service.doctorCount}+ Doctors</span>
                                    </div>
                                </div>

                                {/* Corner Button */}
                                <button className="absolute bottom-0 right-0 flex h-16 w-16 items-center justify-center rounded-br-[30px] rounded-tl-[32px] bg-teal-600 text-white transition-colors hover:bg-teal-700">
                                    {/* <BsArrowUpRight className="text-2xl" /> */}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Banner */}
            <section className="bg-white reveal-on-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className=" overflow-hidden ">
                        <img
                            src={doctorTeam}
                            alt="Our team of experienced doctors"
                            className="w-full object-cover grayscale hover:grayscale-0 transition duration-500 ease-out"
                        />
                    </div>
                </div>
            </section>

            {/* Express Analysis Section */}
            <section className="py-24 bg-gradient-to-br from-[#f6fbfb] via-white to-[#e9f7f4] reveal-on-scroll">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.2fr)_1fr] items-center">
                        {/* Left - visual card */}
                        <div className="relative animate-rise">
                            <div className="relative h-full min-h-[400px] overflow-hidden rounded-[32px] shadow-[0_40px_90px_rgba(15,23,42,0.15)] transition-transform hover:scale-[1.02]">
                                <img
                                    src={expressTeam}
                                    alt="Medical Professional Team"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                        <span className="text-emerald-300">✓</span>
                                        <span>Top-rated Specialists</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - content */}
                        <div className="space-y-6 animate-rise animate-delay-1">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-500/80 mb-3">
                                    Express analysis
                                </p>
                                <h2 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                                    Get lab results in record time.
                                </h2>
                                <p className="text-lg text-slate-600">
                                    We perform all types of laboratory tests. Results are synced to your personal
                                    HealthBook account so you and your doctor can act immediately.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: "Hematology", icon: "🩸", pill: "bg-white text-slate-700" },
                                    { label: "Genetics", icon: "🧬", pill: "bg-white text-slate-700" },
                                    { label: "Biochemistry", icon: "💉", pill: "bg-white text-slate-700" },
                                    { label: "General clinical tests", icon: "🦠", pill: "bg-white text-slate-700" },
                                    { label: "Immunology", icon: "🧪", pill: "bg-white text-slate-700" },
                                    { label: "All", icon: "→", pill: "bg-[#0aa984] text-white" },
                                ].map(({ label, icon, pill }) => (
                                    <div
                                        key={label}
                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-[0_10px_25px_rgba(15,23,42,0.08)] ${pill}`}
                                    >
                                        <span>{icon}</span>
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0fc1a4] to-[#089477] px-8 py-3.5 font-semibold text-white shadow-[0_20px_35px_rgba(15,193,164,0.35)] hover:shadow-[0_25px_45px_rgba(8,148,119,0.45)] transition-transform hover:-translate-y-0.5"
                                >
                                    Sign Up
                                </Link>
                                <button className="inline-flex items-center justify-center rounded-full border border-slate-200 px-8 py-3.5 font-semibold text-slate-700 bg-white hover:border-teal-400 hover:text-teal-600 transition">
                                    Learn more →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section className="py-24 bg-white reveal-on-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Doctors
                        </span>
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Medical center doctors</h2>
                            <p className="text-slate-500 text-lg">
                                Highly qualified specialists with years of hands-on experience and patient trust.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {doctors.map((doctor, index) => (
                            <div
                                key={doctor.name}
                                className="group relative flex flex-col items-center rounded-[40px] border border-transparent bg-white p-8 px-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400 hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)]"
                            >
                                {/* Avatar & Specialty */}
                                <div className="relative mb-6">
                                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#dcfce7] text-5xl text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                                        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ecfccb] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-lime-800 shadow-sm border-[3px] border-white">
                                        {doctor.specialty}
                                    </span>
                                </div>

                                {/* Info */}
                                <h3 className="mb-1 text-xl font-bold text-slate-900">{doctor.name}</h3>
                                <p className="mb-6 text-sm font-medium text-slate-500">{doctor.experience} experience</p>

                                {/* Rating Pill */}
                                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#fffbeb] px-5 py-2 text-sm font-bold text-amber-500">
                                    <HiStar className="text-lg text-amber-400" />
                                    <span>{doctor.rating}</span>
                                    <span className="h-1 w-1 rounded-full bg-amber-300" />
                                    <span className="text-amber-700/80">Patient favorite</span>
                                </div>

                                {/* Action Button */}
                                <Link
                                    to={`/doctors`}
                                    className="w-full rounded-full bg-[#00a884] py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[#008f70] hover:shadow-emerald-500/40 active:scale-95"
                                >
                                    Book Appointment
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            to="/doctors"
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 px-8 py-3.5 font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                            View All Doctors →
                        </Link>
                    </div>
                </div>
            </section>

        </div >
    );
};

export default Home;
