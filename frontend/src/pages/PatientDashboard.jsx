import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, api } from "../context/AuthContext";

const filterChips = [
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "history", label: "History" },
    { id: "all", label: "All" },
];

const wellnessTips = [
    { icon: "💧", text: "Drink 8 cups of water today" },
    { icon: "🚶‍♀️", text: "Take a 20 min walk after lunch" },
    { icon: "😴", text: "Aim for 7-8 hours of sleep" },
    { icon: "🍎", text: "Add a colorful salad to dinner" },
];

const statusStyles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    completed: "bg-slate-100 text-slate-800",
    cancelled: "bg-rose-100 text-rose-800",
};

const PatientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [rescheduleFor, setRescheduleFor] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [cancellingFor, setCancellingFor] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const { data } = await api.get("/bookings");
                setBookings(data.data || []);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const counts = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = bookings.filter((b) => ["pending", "approved"].includes(b.status) && new Date(b.appointmentDate) >= today).length;
        const completed = bookings.filter((b) => b.status === "completed").length;
        const cancelled = bookings.filter((b) => b.status === "cancelled").length;
        const pending = bookings.filter((b) => b.status === "pending").length;

        return { upcoming, completed, cancelled, pending };
    }, [bookings]);

    const nextVisit = useMemo(() => {
        const sorted = [...bookings]
            .filter((b) => ["pending", "approved"].includes(b.status))
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        return sorted[0] || null;
    }, [bookings]);

    const filtered = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (activeTab) {
            case "upcoming":
                return bookings.filter((b) => ["pending", "approved"].includes(b.status) && new Date(b.appointmentDate) >= today);
            case "pending":
                return bookings.filter((b) => b.status === "pending");
            case "completed":
                return bookings.filter((b) => b.status === "completed");
            case "cancelled":
                return bookings.filter((b) => b.status === "cancelled");
            case "history":
                return bookings.filter((b) => b.status === "completed");
            default:
                return bookings;
        }
    }, [bookings, activeTab]);

    const favoriteDoctors = useMemo(() => {
        const map = new Map();
        bookings.forEach((booking) => {
            if (booking.doctor?._id) {
                map.set(booking.doctor._id, booking.doctor);
            }
        });
        return Array.from(map.values()).slice(0, 3);
    }, [bookings]);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const formatTime = (time) => time || "—";

    const openReschedule = (booking) => {
        setRescheduleFor(booking);
        setRescheduleDate("");
        setAvailableSlots([]);
        setSelectedTime("");
    };

    const checkSlots = async () => {
        if (!rescheduleFor || !rescheduleDate) return;
        const params = new URLSearchParams({
            doctorId: rescheduleFor.doctor._id || rescheduleFor.doctor,
            date: rescheduleDate,
        });
        const { data } = await api.get(`/bookings/check-availability?${params.toString()}`);
        setAvailableSlots(data.slots || []);
    };

    const submitReschedule = async () => {
        if (!selectedTime || !rescheduleDate || !rescheduleFor) return;
        const { data } = await api.put(`/bookings/${rescheduleFor._id}`, {
            appointmentDate: rescheduleDate,
            appointmentTime: selectedTime,
        });
        setBookings((prev) => prev.map((b) => (b._id === data.data._id ? data.data : b)));
        setRescheduleFor(null);
    };

    const openCancel = (booking) => {
        setCancellingFor(booking);
        setCancelReason("");
    };

    const submitCancel = async () => {
        if (!cancellingFor) return;
        const id = cancellingFor._id;
        const { data } = await api.delete(`/bookings/${id}`, { data: { reason: cancelReason } });
        setBookings((prev) => prev.map((b) => (b._id === id ? data.data : b)));
        setCancellingFor(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <header className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white p-8 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold tracking-wide">
                                <span role="img" aria-label="sparkles">✨</span>
                                Hi {user?.name?.split(" ")[0] || "there"}, here’s your care hub
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold leading-tight">
                                Manage appointments, prescriptions, and follow-ups in one calm space.
                            </h1>
                            <p className="mt-3 text-white/80 max-w-2xl">
                                Stay in sync with your doctors, track the next visit, and reschedule without phone calls.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to="/doctors"
                                    className="rounded-full bg-white/90 px-6 py-3 text-base font-semibold text-emerald-700 shadow-lg hover:bg-white"
                                >
                                    Browse doctors
                                </Link>
                                <button
                                    onClick={() => navigate("/contact")}
                                    className="rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
                                >
                                    Need help?
                                </button>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/15 backdrop-blur p-5 min-w-[220px]">
                            <p className="text-sm uppercase tracking-wide text-white/70">Next visit</p>
                            {nextVisit ? (
                                <>
                                    <p className="mt-2 text-2xl font-semibold">{formatDate(nextVisit.appointmentDate)}</p>
                                    <p className="text-white/80">{formatTime(nextVisit.appointmentTime)}</p>
                                    <p className="mt-3 text-sm font-medium">
                                        Dr. {nextVisit.doctor?.name} ({nextVisit.doctor?.specialization})
                                    </p>
                                </>
                            ) : (
                                <p className="mt-2 text-sm text-white/80">No upcoming appointments. Book a check-in?</p>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)]" />
                </header>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                        {error}
                    </div>
                )}

                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Upcoming visits",
                            value: loading ? "—" : counts.upcoming,
                            accent: "from-emerald-500/15 to-emerald-500/0",
                            sub: "Ready to confirm or reschedule",
                        },
                        {
                            label: "Pending approvals",
                            value: loading ? "—" : counts.pending,
                            accent: "from-amber-500/15 to-amber-500/0",
                            sub: "Awaiting doctor confirmation",
                        },
                        {
                            label: "Completed visits",
                            value: loading ? "—" : counts.completed,
                            accent: "from-slate-500/15 to-slate-500/0",
                            sub: "View prescriptions & notes",
                        },
                        {
                            label: "Cancelled",
                            value: loading ? "—" : counts.cancelled,
                            accent: "from-rose-500/15 to-rose-500/0",
                            sub: "Rebook whenever you’re ready",
                        },
                    ].map((card, idx) => (
                        <div key={card.label} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg">
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                            <div className="relative z-10">
                                <p className="text-sm uppercase tracking-wide text-slate-400">{card.label}</p>
                                <h3 className="text-3xl font-semibold text-slate-900">{card.value}</h3>
                                <p className="text-sm text-slate-500">{card.sub}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-3xl bg-white shadow-xl p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900">My appointments</h2>
                                <p className="text-slate-500 text-sm">Track upcoming visits, history, and pending actions.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filterChips.map((chip) => (
                                    <button
                                        key={chip.id}
                                        onClick={() => setActiveTab(chip.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === chip.id
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-16 text-center text-slate-500">Loading your appointments…</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-16 text-center text-slate-500">
                                No appointments in this view.{" "}
                                <button onClick={() => navigate("/doctors")} className="text-emerald-600 underline">
                                    Book a doctor
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {filtered.map((booking) => (
                                    <div key={booking._id} className="border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 transition">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-400">{booking.doctor?.specialization}</p>
                                                <h3 className="text-lg font-semibold text-slate-900">Dr. {booking.doctor?.name}</h3>
                                                <p className="text-sm text-slate-500 flex flex-wrap gap-2">
                                                    <span>{formatDate(booking.appointmentDate)}</span>
                                                    <span>•</span>
                                                    <span>{formatTime(booking.appointmentTime)}</span>
                                                    {booking.doctor?.hospital?.name && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{booking.doctor.hospital.name}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${statusStyles[booking.status] || "bg-slate-100 text-slate-700"}`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        {booking.status === "completed" && booking.visitNotes && (
                                            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                                <p className="font-semibold mb-1 text-slate-800">Visit notes</p>
                                                <p>{typeof booking.visitNotes === "string" ? booking.visitNotes : booking.visitNotes?.doctorNotes}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {["pending", "approved"].includes(booking.status) && (
                                                <button
                                                    onClick={() => openReschedule(booking)}
                                                    className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    Reschedule
                                                </button>
                                            )}
                                            {booking.status !== "completed" && (
                                                <button
                                                    onClick={() => openCancel(booking)}
                                                    className="rounded-full border border-rose-600 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/doctors/${booking.doctor?._id || booking.doctor}`)}
                                                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                                            >
                                                Doctor profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-white shadow-xl p-6">
                            <p className="text-sm uppercase tracking-wide text-slate-400">Next appointment</p>
                            {nextVisit ? (
                                <>
                                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{formatDate(nextVisit.appointmentDate)}</h3>
                                    <p className="text-sm text-slate-500">{formatTime(nextVisit.appointmentTime)}</p>
                                    <p className="mt-3 text-sm font-medium">
                                        Dr. {nextVisit.doctor?.name} ({nextVisit.doctor?.specialization})
                                    </p>
                                </>
                            ) : (
                                <p className="mt-3 text-sm text-slate-500">You’re all set for now. Schedule a wellbeing check?</p>
                            )}
                        </div>

                        <div className="rounded-3xl bg-white shadow-xl p-6">
                            <p className="text-sm uppercase tracking-wide text-slate-400">Your care circle</p>
                            {favoriteDoctors.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">Recently visited doctors will appear here.</p>
                            ) : (
                                <ul className="mt-3 space-y-3">
                                    {favoriteDoctors.map((doctor) => (
                                        <li key={doctor._id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">Dr. {doctor.name}</p>
                                                <p className="text-sm text-slate-500">{doctor.specialization}</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/doctors/${doctor._id}`)}
                                                className="text-sm font-semibold text-emerald-600"
                                            >
                                                Book
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl">
                            <p className="text-sm uppercase tracking-wide text-white/70">Healthy routines</p>
                            <ul className="mt-4 space-y-3">
                                {wellnessTips.map((tip) => (
                                    <li key={tip.text} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                                        <span className="text-xl">{tip.icon}</span>
                                        <p className="text-sm">{tip.text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-3xl bg-white shadow-xl p-6">
                            <p className="text-sm uppercase tracking-wide text-slate-400">Need care now?</p>
                            <p className="text-sm text-slate-500 mt-2">Reach out to our support team for urgent help.</p>
                            <button
                                onClick={() => navigate("/contact")}
                                className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                Contact support
                            </button>
                        </div>
                    </aside>
                </section>
            </div>

            {rescheduleFor && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg space-y-5">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">Reschedule appointment</h3>
                            <p className="text-sm text-slate-500 mt-1">Choose a new date and time for your visit.</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Choose date</label>
                            <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2"
                            />
                        </div>
                        <button onClick={checkSlots} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                            Check availability
                        </button>
                        {availableSlots.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-2">Select time</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.map((slot, index) => (
                                        <button
                                            key={`${slot.time}-${index}`}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.time)}
                                            className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${selectedTime === slot.time
                                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                                : slot.available
                                                    ? "border-slate-200 text-slate-600 hover:border-emerald-200"
                                                    : "border-slate-100 text-slate-300 cursor-not-allowed"
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setRescheduleFor(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                                Cancel
                            </button>
                            <button
                                onClick={submitReschedule}
                                disabled={!selectedTime || !rescheduleDate}
                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {cancellingFor && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">Cancel appointment</h3>
                            <p className="text-sm text-slate-500 mt-1">Optional: let us know the reason.</p>
                        </div>
                        <textarea
                            rows={4}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-rose-300 focus:outline-none text-sm"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setCancellingFor(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                                Keep slot
                            </button>
                            <button
                                onClick={submitCancel}
                                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white"
                            >
                                Confirm cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
