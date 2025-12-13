import { Link } from "react-router-dom";
import doctorTeam from "../assets/images/DoctorTeam.png";
import heroFallback from "../assets/images/hero-img01.png";

const Home = () => {


    // Service icon components
    const ServiceIcon = ({ type }) => {
        const icons = {
            adult: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            child: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            home: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            surgery: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            ultrasound: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
            ),
            xray: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            diagnostic: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            medical: (
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        };
        return icons[type] || icons.adult;
    };

    const services = [
        { iconType: "adult", title: "Adult Reception", subtitle: "Consultation" },
        { iconType: "child", title: "Children's Reception", subtitle: "Pediatrics" },
        { iconType: "home", title: "Home Visit", subtitle: "Doctor at home" },
        { iconType: "surgery", title: "Operational Block", subtitle: "Surgery" },
        { iconType: "ultrasound", title: "Ultrasound Diagnostics", subtitle: "Examination" },
        { iconType: "xray", title: "X-ray Cabinet", subtitle: "Diagnostics" },
        { iconType: "diagnostic", title: "Functional Diagnostics", subtitle: "Analysis" },
        { iconType: "medical", title: "Medical Services", subtitle: "At home" },
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

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-50 to-teal-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div>
                            <div className="inline-block px-4 py-2 bg-yellow-300 rounded-full text-sm font-semibold mb-6">
                                ⚡ Medical center for everyone
                            </div>

                            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                Book doctor appointments
                                effortlessly
                                for you and your family
                            </h1>

                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                A trusted healthcare platform designed to connect patients and doctors through seamless appointment booking, secure medical records, and efficient clinic management.
                            </p>

                            <div className="flex items-center space-x-4 mb-8">
                                <Link
                                    to="/register"
                                    className="px-8 py-3.5 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition shadow-lg"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/doctors"
                                    className="px-8 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-teal-600 hover:text-teal-600 transition"
                                >
                                    Find Doctors →
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-4 bg-white rounded-2xl p-4 shadow-md inline-flex">
                                <div className="flex -space-x-2">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">+68</p>
                                    <p className="text-sm text-gray-600">Professional doctors<br />with experience</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Hero Image */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl p-4 relative overflow-hidden min-h-[500px] flex items-center justify-center">
                                <div className="bg-white rounded-2xl w-full h-full flex items-center justify-center p-2">
                                    <img
                                        src={heroSrc}
                                        alt="Doctor team"
                                        className="relative z-10 rounded-xl w-full h-full max-h-[460px] object-cover shadow-2xl"
                                        loading="eager"
                                        onError={(e) => { e.currentTarget.src = heroFallback; }}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-white/10"></div>
                            </div>

                            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
                                <div className="flex items-center space-x-2">

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Personal approach to everyone</h3>
                                    <p className="text-gray-600">
                                        Individual treatment programs. Comprehensive examination. Comfortable conditions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-lime-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Check-up list by directions:</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                    <span className="text-sm font-medium">Gastroenterology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                    <span className="text-sm font-medium">Cardiology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                    <span className="text-sm font-medium">Pediatrics</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                    <span className="text-sm font-medium">Endocrinology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                    <span className="text-sm font-medium">Gynecology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                    <span className="text-sm font-medium">Immunology</span>
                                </div>
                            </div>
                            <button className="mt-4 text-teal-600 font-semibold hover:text-teal-700 transition">
                                Learn more →
                            </button>
                        </div>
                    </div>
                </div>
            </section >

            {/* Services Section */}
            < section className="py-20 bg-white" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-block px-4 py-2 bg-yellow-300 rounded-full text-sm font-semibold mb-6">
                        ⚡ Services
                    </div>

                    <h2 className="text-4xl font-bold text-gray-900 mb-12">Wide range of services</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-2xl p-6 hover:bg-teal-50 hover:shadow-lg transition cursor-pointer group"
                            >
                                <div className="mb-4">
                                    <ServiceIcon type={service.iconType} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{service.title}</h3>
                                <p className="text-sm text-gray-600">{service.subtitle}</p>
                                <div className="mt-4 text-teal-600 opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-2xl">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Express Analysis Section */}
            < section className="py-20 bg-gradient-to-br from-gray-50 to-teal-50" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Image */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center">
                                <div className="text-center text-white">
                                    <svg className="w-24 h-24 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    <p className="text-2xl font-bold">Laboratory Analysis</p>
                                </div>
                            </div>
                        </div>

                        {/* Right - Content */}
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Express analysis</h2>
                            <p className="text-gray-600 mb-8">
                                We perform all types of laboratory tests. The results of the study are available in your personal account.
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm mr-2">
                                    🩸 Hematology
                                </div>
                                <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm mr-2">
                                    🧬 Genetics
                                </div>
                                <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm mr-2">
                                    💉 Biochemistry
                                </div>
                                <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm mr-2">
                                    🦠 General clinical tests
                                </div>
                                <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm mr-2">
                                    🧪 Immunology
                                </div>
                                <div className="inline-block px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium shadow-sm">
                                    All →
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/register"
                                    className="px-8 py-3.5 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition shadow-lg"
                                >
                                    Sign Up
                                </Link>
                                <button className="px-8 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-teal-600 hover:text-teal-600 transition">
                                    Learn more →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Doctors Section */}
            < section className="py-20 bg-white" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="inline-block px-4 py-2 bg-yellow-300 rounded-full text-sm font-semibold mb-6">
                        ⚡ Doctors
                    </div>

                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Medical center doctors</h2>
                    <p className="text-gray-600 mb-12">
                        Highly qualified specialists with many years of experience
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {doctors.map((doctor, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-teal-500"
                            >
                                <div className="text-center mb-4">
                                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-20 h-20 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="inline-block px-3 py-1 bg-lime-200 rounded-full text-xs font-semibold mb-2">
                                        {doctor.specialty}
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg mb-1 text-center">{doctor.name}</h3>
                                <p className="text-sm text-gray-600 text-center mb-3">{doctor.experience} experience</p>

                                <div className="flex items-center justify-center space-x-1 mb-4">
                                    <span className="text-yellow-400">⭐</span>
                                    <span className="font-semibold text-gray-900">{doctor.rating}</span>
                                </div>

                                <Link
                                    to={`/doctors/${index + 1}`}
                                    className="block w-full py-2.5 bg-teal-600 text-white text-center rounded-full font-medium hover:bg-teal-700 transition"
                                >
                                    Book Appointment
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/doctors"
                            className="inline-block px-8 py-3.5 bg-white border-2 border-teal-600 text-teal-600 rounded-full font-semibold hover:bg-teal-50 transition"
                        >
                            View All Doctors →
                        </Link>
                    </div>
                </div>
            </section >

        </div >
    );
};

export default Home;
