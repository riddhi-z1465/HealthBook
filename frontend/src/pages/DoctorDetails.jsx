import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaStar, FaBriefcase, FaMoneyBillWave } from "react-icons/fa";
import AuthPromptModal from "../components/AuthPromptModal";
import BookAppointmentModal from "../components/BookAppointmentModal";
import { api, useAuth } from "../context/AuthContext";

const calculateExperienceYears = (experiences = []) => {
    if (!experiences.length) return null;
    const totalYears = experiences.reduce((sum, exp) => {
        if (!exp.startDate) return sum;
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const diffYears = (end - start) / (1000 * 60 * 60 * 24 * 365);
        return sum + Math.max(diffYears, 0);
    }, 0);
    return Math.max(1, Math.round(totalYears));
};

const DoctorDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [authPromptOpen, setAuthPromptOpen] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const { data } = await api.get(`/doctors/${id}`);
                setDoctor(data.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load doctor profile right now.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    const yearsOfExperience = useMemo(() => {
        if (!doctor) return null;
        return doctor.experienceYears || calculateExperienceYears(doctor.experiences) || null;
    }, [doctor]);

    const languages = useMemo(() => {
        if (!doctor) return [];
        if (Array.isArray(doctor.languages) && doctor.languages.length) return doctor.languages;
        return ["English"];
    }, [doctor]);

    const consultationModes = useMemo(() => {
        if (!doctor) return [];
        if (Array.isArray(doctor.consultationModes) && doctor.consultationModes.length) return doctor.consultationModes;
        const modes = [];
        if (doctor.hospital?.address) modes.push("In-clinic");
        modes.push("Online consult");
        return modes;
    }, [doctor]);

    const mapQuery = useMemo(() => {
        if (!doctor?.hospital) return null;
        const { name, address, city, state } = doctor.hospital;
        const parts = [name, address, city, state].filter(Boolean);
        if (!parts.length) return null;
        return parts.join(", ");
    }, [doctor]);

    const handleBookAppointment = () => {
        setActionError(null);
        if (!user) {
            setAuthPromptOpen(true);
            return;
        }
        if (user.role !== "patient") {
            setActionError("Please log in as a patient to book appointments.");
            return;
        }
        setBookingOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <p className="text-slate-500">Loading doctor profile…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center space-y-4">
                <p className="text-rose-600 font-semibold text-lg">{error}</p>
                <Link
                    to="/doctors"
                    className="rounded-full bg-teal-600 px-6 py-2 text-white font-semibold"
                >
                    Back to all doctors
                </Link>
            </div>
        );
    }

    if (!doctor) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
                    type="button"
                >
                    ← Back
                </button>

                <section className="rounded-3xl bg-white shadow-2xl p-6 md:p-8 space-y-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="flex-shrink-0">
                            {doctor.photo ? (
                                <img
                                    src={doctor.photo}
                                    alt={doctor.name}
                                    className="h-40 w-40 rounded-3xl object-cover border-4 border-emerald-50"
                                />
                            ) : (
                                <div className="h-40 w-40 rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-5xl font-semibold text-teal-600">
                                    {doctor.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
                                {doctor.medicalTitle || "Consultant"} • {doctor.specialization || "Specialist"}
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900">{doctor.name}</h1>
                            <p className="text-slate-500 text-lg">
                                {doctor.bio || "Passionate about delivering modern, compassionate care tailored to every patient."}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                                    <FaStar className="text-amber-500" /> {doctor.averageRating ? doctor.averageRating.toFixed(1) : "—"} ({doctor.totalRating || 0} reviews)
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                                    <FaBriefcase className="text-slate-500" /> {yearsOfExperience ? `${yearsOfExperience}+ yrs experience` : "Experience info unavailable"}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                                    <FaMoneyBillWave className="text-emerald-600" /> {doctor.ticketPrice ? `₹${doctor.ticketPrice.toLocaleString()}` : "Fee on request"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleBookAppointment}
                            className="rounded-full bg-emerald-600 px-6 py-3 text-white text-sm font-semibold hover:bg-emerald-700"
                            type="button"
                        >
                            Book appointment
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            type="button"
                        >
                            Contact clinic
                        </button>
                        <Link
                            to="/doctors"
                            className="rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-slate-500 hover:text-slate-900"
                        >
                            View all doctors
                        </Link>
                    </div>
                    {actionError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            {actionError}
                        </div>
                    )}
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-slate-900">Professional details</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-slate-400">Medical qualifications</dt>
                                <dd className="mt-1 space-y-1 text-sm text-slate-700">
                                    {doctor.qualifications?.length
                                        ? doctor.qualifications.map((q, index) => (
                                            <div key={`${q.degree}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-2">
                                                <p className="font-semibold text-slate-900">{q.degree}</p>
                                                <p className="text-xs text-slate-500">{q.university}</p>
                                            </div>
                                        ))
                                        : "Qualification details not provided."}
                                </dd>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Medical license</dt>
                                    <dd className="mt-1 text-sm text-slate-700">
                                        {doctor.licenseNumber || "Available on request"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">Languages</dt>
                                    <dd className="mt-1 flex flex-wrap gap-2 text-sm">
                                        {languages.map((lang) => (
                                            <span key={lang} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 text-xs font-semibold">
                                                {lang}
                                            </span>
                                        ))}
                                    </dd>
                                </div>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-slate-400">Certifications</dt>
                                <dd className="mt-1 text-sm text-slate-700 space-y-1">
                                    {doctor.certifications?.length
                                        ? doctor.certifications.map((cert, idx) => (
                                            <div key={`${cert}-${idx}`} className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
                                                {cert}
                                            </div>
                                        ))
                                        : "No additional certifications listed."}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-slate-900">Clinic & location</h2>
                        <div className="space-y-2 text-sm text-slate-700">
                            <p className="text-lg font-semibold text-slate-900">{doctor.hospital?.name || "Independent practitioner"}</p>
                            <p>{doctor.hospital?.address || "Address shared upon confirmation"}</p>
                            <p className="text-xs text-slate-500">
                                {[doctor.hospital?.city, doctor.hospital?.state].filter(Boolean).join(", ")}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {consultationModes.map((mode) => (
                                <span key={mode} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {mode}
                                </span>
                            ))}
                        </div>
                        {mapQuery && (
                            <div className="mt-4 h-64 overflow-hidden rounded-2xl border border-slate-100">
                                <iframe
                                    title="Clinic map"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
                                    width="100%"
                                    height="100%"
                                    loading="lazy"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                        )}
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-900">Availability</p>
                            <p className="text-xs mt-1 text-slate-500">
                                Schedule last updated {new Date(doctor.updatedAt || doctor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <Link to="/doctor/schedule" className="mt-3 inline-flex text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                                Manage weekly slots →
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">Experience highlights</h2>
                    {doctor.experiences?.length ? (
                        <div className="space-y-3">
                            {doctor.experiences.map((exp, idx) => (
                                <div key={`${exp.position}-${idx}`} className="rounded-2xl border border-slate-100 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-900">{exp.position}</p>
                                    <p className="text-xs text-slate-500">{exp.hospital}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Start"} —{" "}
                                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : exp.isCurrent ? "Present" : "Present"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Experience details will appear once the doctor updates their profile.</p>
                    )}
                </section>
            </div>

            <BookAppointmentModal
                doctor={doctor}
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                onBooked={() => {
                    setBookingOpen(false);
                    navigate("/patient-dashboard");
                }}
            />

            <AuthPromptModal
                open={authPromptOpen}
                doctorName={doctor?.name}
                onClose={() => setAuthPromptOpen(false)}
                onLogin={() => navigate("/login", { state: { redirectTo: `/doctors/${doctor?._id}` } })}
                onRegister={() => navigate("/register", { state: { redirectTo: `/doctors/${doctor?._id}` } })}
            />
        </div>
    );
};

export default DoctorDetails;
