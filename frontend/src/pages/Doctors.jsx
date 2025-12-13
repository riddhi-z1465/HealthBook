import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthPromptModal from "../components/AuthPromptModal";
import BookAppointmentModal from "../components/BookAppointmentModal";
import { api, useAuth } from "../context/AuthContext";

const Doctors = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [activeSpecialty, setActiveSpecialty] = useState("all");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [authPromptOpen, setAuthPromptOpen] = useState(false);
    const [authPromptDoctor, setAuthPromptDoctor] = useState(null);

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/doctors");
            setDoctors(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load doctors right now.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const specialties = useMemo(() => {
        const values = new Set(doctors.map((doc) => doc.specialization).filter(Boolean));
        return ["all", ...Array.from(values)];
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        return doctors.filter((doctor) => {
            const matchesSpecialty = activeSpecialty === "all" || doctor.specialization === activeSpecialty;
            const matchesSearch =
                doctor.name?.toLowerCase().includes(search.toLowerCase()) ||
                doctor.specialization?.toLowerCase().includes(search.toLowerCase()) ||
                doctor.hospital?.name?.toLowerCase().includes(search.toLowerCase());
            return matchesSpecialty && matchesSearch;
        });
    }, [doctors, activeSpecialty, search]);

    const handleBookClick = (doctor) => {
        if (!user) {
            setAuthPromptDoctor(doctor);
            setAuthPromptOpen(true);
            return;
        }
        if (user.role !== "patient") {
            setError("Please login as a patient to book appointments.");
            return;
        }
        setSelectedDoctor(doctor);
        setModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-10 text-white">
                <div className="max-w-3xl space-y-4">
                    <p className="text-sm uppercase tracking-[0.35em] text-white/80">Specialists on call</p>
                    <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                        Book trusted, verified doctors with real-time availability
                    </h1>
                    <p className="text-white/80">
                        Explore approved doctors, see their live slots, and lock an appointment in seconds. Your health
                        team is just a tap away.
                    </p>
                </div>
                <div className="absolute -right-32 bottom-0 hidden h-64 w-64 rounded-full bg-white/10 blur-3xl md:block" />
            </div>

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-3">
                    <input
                        type="text"
                        placeholder="Search by doctor, specialty, hospital…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {specialties.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => setActiveSpecialty(spec)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                activeSpecialty === spec
                                    ? "bg-teal-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {spec === "all" ? "All specialties" : spec}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse rounded-2xl border border-gray-100 p-6">
                            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-200" />
                            <div className="mx-auto mb-2 h-4 w-32 rounded-full bg-gray-200" />
                            <div className="mx-auto mb-4 h-3 w-24 rounded-full bg-gray-200" />
                            <div className="mb-2 h-3 w-full rounded-full bg-gray-100" />
                            <div className="mb-2 h-3 w-3/4 rounded-full bg-gray-100" />
                            <div className="mt-6 h-10 w-full rounded-full bg-gray-100" />
                        </div>
                    ))}
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No doctors match your filters yet. Try adjusting your search or check back soon.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doctor) => (
                        <div
                            key={doctor._id}
                            className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100/70 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                                    {doctor.photo ? (
                                        <img
                                            src={doctor.photo}
                                            alt={doctor.name}
                                            className="h-20 w-20 rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-semibold text-teal-600">
                                            {doctor.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-teal-600">Verified doctor</p>
                                    <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-600">
                                    ⭐ {doctor.averageRating?.toFixed(1) || "—"}{" "}
                                    <span className="text-xs text-amber-500">
                                        ({doctor.totalRating || 0} reviews)
                                    </span>
                                </span>
                                {doctor.hospital?.city && (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="text-lg">📍</span>
                                        {doctor.hospital.city}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-2">
                                    <span className="text-lg">💼</span>
                                    {doctor.totalPatients || 0} patients
                                </span>
                            </div>
                            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                                {doctor.hospital?.name ? (
                                    <>
                                        <p className="font-semibold text-gray-900">{doctor.hospital.name}</p>
                                        <p>{doctor.hospital.address}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Hospital / clinic details not provided.</p>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Consultation fee</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        ₹{doctor.ticketPrice?.toLocaleString() || "—"}
                                    </p>
                                </div>
                                <Link
                                    to={`/doctors/${doctor._id}`}
                                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    View profile
                                </Link>
                            </div>
                            <button
                                onClick={() => handleBookClick(doctor)}
                                className="mt-5 w-full rounded-full bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
                            >
                                Book appointment
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <BookAppointmentModal
                doctor={selectedDoctor}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedDoctor(null);
                }}
                onBooked={() => {
                    setModalOpen(false);
                    setSelectedDoctor(null);
                    navigate("/patient-dashboard");
                }}
            />
            <AuthPromptModal
                doctorName={authPromptDoctor?.name}
                open={authPromptOpen}
                onClose={() => {
                    setAuthPromptOpen(false);
                    setAuthPromptDoctor(null);
                }}
                onLogin={() => navigate("/login", { state: { redirectTo: "/doctors" } })}
                onRegister={() => navigate("/register", { state: { redirectTo: "/doctors" } })}
            />
        </div>
    );
};

export default Doctors;
