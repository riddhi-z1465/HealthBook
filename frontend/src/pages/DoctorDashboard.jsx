import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineBadgeCheck, HiOutlineClock, HiOutlineRefresh } from "react-icons/hi";
import { api, useAuth } from "../context/AuthContext";

const statusPills = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    completed: "bg-slate-100 text-slate-800",
    cancelled: "bg-rose-100 text-rose-800",
};

const chipOptions = [
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "all", label: "All" },
];

const DoctorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const doctorId = user?._id || user?.id;
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("today");
    const [actionInFlight, setActionInFlight] = useState(null);
    const [completeModal, setCompleteModal] = useState({ open: false, bookingId: null, notes: "" });
    const [refreshing, setRefreshing] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);

    const combineDateTime = (appointment) => {
        const date = new Date(appointment.appointmentDate);
        if (appointment.appointmentTime) {
            const [hours, minutes] = appointment.appointmentTime.split(":").map((v) => parseInt(v, 10));
            date.setHours(hours || 0, minutes || 0, 0, 0);
        }
        return date;
    };

    const loadStats = useCallback(async () => {
        if (!doctorId) return;
        try {
            setLoadingStats(true);
            const { data } = await api.get(`/doctors/${doctorId}/stats`);
            setStats(data.data);
            setDashboardError(null);
        } catch (err) {
            setDashboardError(err.response?.data?.message || "Failed to load dashboard stats");
        } finally {
            setLoadingStats(false);
        }
    }, [doctorId]);

    const loadAppointments = useCallback(async () => {
        if (!doctorId) return;
        try {
            setLoadingAppointments(true);
            const { data } = await api.get("/bookings");
            const scoped = Array.isArray(data.data)
                ? data.data.filter((booking) => {
                    const bookingDoctorId = booking.doctor?._id || booking.doctor;
                    return bookingDoctorId?.toString() === doctorId.toString();
                })
                : [];
            setAppointments(scoped);
            setDashboardError(null);
        } catch (err) {
            setDashboardError(err.response?.data?.message || "Failed to load appointments");
        } finally {
            setLoadingAppointments(false);
        }
    }, [doctorId]);

    const refreshDashboard = useCallback(async () => {
        if (!doctorId) return;
        try {
            setRefreshing(true);
            await Promise.all([loadStats(), loadAppointments()]);
            setLastSynced(new Date());
        } finally {
            setRefreshing(false);
        }
    }, [doctorId, loadStats, loadAppointments]);

    useEffect(() => {
        refreshDashboard();
    }, [refreshDashboard]);

    useEffect(() => {
        if (!doctorId) return;
        const interval = setInterval(() => {
            refreshDashboard();
        }, 60000);
        return () => clearInterval(interval);
    }, [doctorId, refreshDashboard]);

    const countByStatus = useMemo(() => ({
        pending: appointments.filter((a) => a.status === "pending").length,
        approved: appointments.filter((a) => a.status === "approved").length,
        today: appointments.filter((a) => {
            const day = combineDateTime(a);
            const now = new Date();
            const end = new Date(now);
            now.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return ["approved", "pending"].includes(a.status) && day >= now && day <= end;
        }).length,
        completed: appointments.filter((a) => a.status === "completed").length,
        total: appointments.length,
    }), [appointments]);

    const filteredAppointments = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        switch (activeFilter) {
            case "today":
                return appointments.filter((appointment) => {
                    const slot = combineDateTime(appointment);
                    return slot >= startOfToday && slot <= endOfToday && ["pending", "approved"].includes(appointment.status);
                });
            case "upcoming":
                return appointments.filter((appointment) => combineDateTime(appointment) > endOfToday && ["pending", "approved"].includes(appointment.status));
            case "pending":
                return appointments.filter((appointment) => appointment.status === "pending");
            case "completed":
                return appointments.filter((appointment) => appointment.status === "completed");
            default:
                return appointments;
        }
    }, [activeFilter, appointments]);

    const nextAppointment = useMemo(() => {
        const sorted = [...appointments]
            .filter((a) => ["pending", "approved"].includes(a.status))
            .sort((a, b) => combineDateTime(a) - combineDateTime(b));
        return sorted[0] || null;
    }, [appointments]);

    const handleApprove = async (bookingId) => {
        try {
            setActionInFlight(bookingId);
            await api.put(`/bookings/${bookingId}/approve`);
            await Promise.all([loadAppointments(), loadStats()]);
        } catch (err) {
            setDashboardError(err.response?.data?.message || "Failed to approve appointment");
        } finally {
            setActionInFlight(null);
        }
    };

    const handleComplete = async () => {
        if (!completeModal.bookingId) return;
        try {
            setActionInFlight(completeModal.bookingId);
            await api.put(`/bookings/${completeModal.bookingId}/complete`, {
                visitNotes: completeModal.notes.trim()
                    ? { doctorNotes: completeModal.notes.trim() }
                    : undefined,
            });
            setCompleteModal({ open: false, bookingId: null, notes: "" });
            await Promise.all([loadAppointments(), loadStats()]);
        } catch (err) {
            setDashboardError(err.response?.data?.message || "Failed to complete appointment");
        } finally {
            setActionInFlight(null);
        }
    };

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const disabled = user?.isApproved !== "approved";

    const firstName = user?.name?.split(" ")[0] || "Caregiver";
    const specialization = user?.specialization || user?.medicalTitle || "General Physician";
    const statusLabel = user?.isApproved === "approved" ? "Verified" : user?.isApproved === "pending" ? "Pending review" : "Needs verification";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <header className="rounded-[36px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent_55%)]" />
                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-6 max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold tracking-wide">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base">⚕️</span>
                                {specialization}
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm uppercase tracking-[0.4em] text-white/70">Dashboard</p>
                                <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Welcome back, Dr. {firstName}</h1>
                                <p className="text-lg text-white/80 max-w-2xl">
                                    Track today’s workload, stay on top of approvals, and manage every patient visit from one modern dashboard.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/30 bg-white/10/0 p-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.5em] text-white/70">Today</p>
                                    <p className="mt-3 text-3xl font-semibold">{countByStatus.today}</p>
                                    <p className="text-sm text-white/75">Appointments scheduled</p>
                                </div>
                                <div className="rounded-2xl border border-white/30 bg-white/10/0 p-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-[0.5em] text-white/70">Pending</p>
                                    <p className="mt-3 text-3xl font-semibold">{countByStatus.pending}</p>
                                    <p className="text-sm text-white/75">Awaiting approval</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-sm rounded-3xl bg-white/15 backdrop-blur p-6 space-y-5 border border-white/10">
                            <div className="rounded-2xl bg-white/10 p-5 space-y-3">
                                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Account status</p>
                                <div className="flex items-center gap-2 text-2xl font-semibold">
                                    {statusLabel}
                                    {user?.isApproved === "approved" ? (
                                        <HiOutlineBadgeCheck className="h-7 w-7 text-emerald-200" />
                                    ) : (
                                        <HiOutlineClock className="h-7 w-7 text-amber-200" />
                                    )}
                                </div>
                                <p className="text-sm text-white/80">
                                    {!disabled
                                        ? "You can manage appointments freely."
                                        : "Waiting for admin approval. You’ll be notified once reviewed."}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 p-5 space-y-4 text-sm text-white/80">
                                <div className="flex items-center justify-between">
                                    <span>Last sync</span>
                                    <span className="font-semibold">{lastSynced ? lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                                </div>
                                <div className="grid gap-3">
                                    <button
                                        onClick={refreshDashboard}
                                        disabled={refreshing}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 disabled:opacity-50"
                                        type="button"
                                    >
                                        <HiOutlineRefresh className="h-4 w-4" />
                                        {refreshing ? "Refreshing…" : "Force refresh"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {dashboardError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                        {dashboardError}
                    </div>
                )}

                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Today’s appointments",
                            value: loadingStats ? "—" : stats?.todayAppointments ?? 0,
                            accent: "from-emerald-500/10 to-emerald-500/0",
                            sub: `${countByStatus.today} scheduled today`,
                        },
                        {
                            label: "Pending approvals",
                            value: loadingStats ? "—" : stats?.pendingAppointments ?? 0,
                            accent: "from-amber-500/10 to-amber-500/0",
                            sub: `${countByStatus.pending} awaiting your action`,
                        },
                        {
                            label: "Completed visits",
                            value: loadingStats ? "—" : stats?.completedAppointments ?? 0,
                            accent: "from-slate-500/10 to-slate-500/0",
                            sub: `${stats?.totalPatients ?? user?.totalPatients ?? 0} total patients`,
                        },
                        {
                            label: "Average rating",
                            value: user?.averageRating ? user.averageRating.toFixed(1) : "—",
                            accent: "from-indigo-500/10 to-indigo-500/0",
                            sub: `${stats?.totalReviews ?? 0} patient reviews`,
                        },
                    ].map((card, idx) => (
                        <div key={idx} className="rounded-2xl bg-white p-6 shadow-lg relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                            <div className="relative z-10">
                                <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                                <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
                                <p className="mt-2 text-sm text-slate-500">{card.sub}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-3xl bg-white shadow-xl p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900">Appointment pipeline</h2>
                                <p className="text-slate-500 text-sm">Approve, complete, or review every booked slot.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {chipOptions.map((chip) => (
                                    <button
                                        key={chip.id}
                                        onClick={() => setActiveFilter(chip.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeFilter === chip.id
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {chip.label}
                                        {chip.id === "pending" && ` (${countByStatus.pending})`}
                                        {chip.id === "completed" && ` (${countByStatus.completed})`}
                                        {chip.id === "today" && ` (${countByStatus.today})`}
                                        {chip.id === "all" && ` (${countByStatus.total})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingAppointments ? (
                            <div className="py-16 text-center text-slate-500">Loading appointments…</div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="py-16 text-center text-slate-500">No appointments in this view.</div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAppointments.map((appointment) => (
                                    <div key={appointment._id} className="border border-slate-100 rounded-2xl p-4 hover:border-emerald-200 transition">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-400">{appointment.doctor?.specialization || user?.specialization}</p>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {appointment.user?.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 flex gap-3 flex-wrap mt-1">
                                                    <span>{formatDate(appointment.appointmentDate)}</span>
                                                    <span>•</span>
                                                    <span>{appointment.appointmentTime}</span>
                                                    {appointment.user?.phone && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{appointment.user.phone}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${statusPills[appointment.status] || "bg-slate-100 text-slate-700"}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        {appointment.notes && (
                                            <p className="mt-3 text-sm text-slate-600">{appointment.notes}</p>
                                        )}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {appointment.status === "pending" && (
                                                <button
                                                    disabled={disabled || actionInFlight === appointment._id}
                                                    onClick={() => handleApprove(appointment._id)}
                                                    className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                                                >
                                                    {actionInFlight === appointment._id ? "Approving…" : "Approve slot"}
                                                </button>
                                            )}
                                            {["pending", "approved"].includes(appointment.status) && (
                                                <button
                                                    disabled={disabled}
                                                    onClick={() => setCompleteModal({ open: true, bookingId: appointment._id, notes: "" })}
                                                    className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-50"
                                                >
                                                    Add visit notes
                                                </button>
                                            )}
                                            <button
                                                className="px-4 py-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-600"
                                                disabled
                                            >
                                                Patient history
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-white shadow-xl p-6">
                            <p className="text-sm font-medium text-slate-500">Next appointment</p>
                            {nextAppointment ? (
                                <>
                                    <p className="mt-3 text-2xl font-semibold text-slate-900">{formatDate(nextAppointment.appointmentDate)}</p>
                                    <p className="text-slate-500">{nextAppointment.appointmentTime}</p>
                                    <div className="mt-4 rounded-2xl border border-slate-100 p-4">
                                        <p className="text-sm text-slate-500">Patient</p>
                                        <p className="text-lg font-semibold text-slate-900">{nextAppointment.user?.name}</p>
                                        <p className="text-sm text-slate-500 mt-1">{nextAppointment.user?.email}</p>
                                        {nextAppointment.user?.phone && (
                                            <p className="text-sm text-slate-500 mt-1">{nextAppointment.user.phone}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-4 text-slate-500">You&apos;re all clear—no upcoming patients.</p>
                            )}
                        </div>

                        <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl">
                            <h3 className="text-xl font-semibold">Availability</h3>
                            <p className="text-white/70 text-sm mt-2">Quick view of weekly slots</p>
                            <div className="mt-5 space-y-3">
                                {user?.timeSlots?.length ? (
                                    user.timeSlots.slice(0, 4).map((slot, index) => (
                                        <div key={`${slot.day}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium">{slot.day}</p>
                                                <p className="text-xs text-white/70">
                                                    {slot.startTime} - {slot.endTime}
                                                </p>
                                            </div>
                                            <span className="text-xs uppercase tracking-wide text-emerald-200">
                                                {slot.slotDuration}m slots
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-white/70">No schedule set. Update your availability to let patients book you.</p>
                                )}
                            </div>
                            <button
                                disabled={disabled}
                                onClick={() => navigate("/doctor/schedule")}
                                className="mt-5 w-full rounded-full bg-white text-slate-900 font-semibold py-2 disabled:opacity-40"
                                type="button"
                            >
                                Manage schedule
                            </button>
                        </div>
                    </aside>
                </section>
            </div>

            {completeModal.open && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-semibold text-slate-900">Complete appointment</h3>
                        <p className="text-sm text-slate-500 mt-1">Add quick visit notes — visible to the patient immediately.</p>
                        <textarea
                            rows={4}
                            value={completeModal.notes}
                            onChange={(e) => setCompleteModal((prev) => ({ ...prev, notes: e.target.value }))}
                            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-400 focus:outline-none text-sm"
                            placeholder="Summary, prescription, follow-up instructions..."
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setCompleteModal({ open: false, bookingId: null, notes: "" })}
                                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={actionInFlight === completeModal.bookingId}
                                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                            >
                                {actionInFlight === completeModal.bookingId ? "Saving…" : "Mark as completed"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
