import { useEffect, useMemo, useState } from "react";
import { api, useAuth } from "../context/AuthContext";

const adminActions = [
    { title: "Approve Doctors", subtitle: "Review pending profiles", color: "from-emerald-500 to-teal-500" },
    { title: "Manage Users", subtitle: "Deactivate or reset access", color: "from-sky-500 to-indigo-500" },
    { title: "View Bookings", subtitle: "Daily appointment grid", color: "from-amber-500 to-orange-500" },
    { title: "Analytics", subtitle: "Utilization & trends", color: "from-purple-500 to-pink-500" },
    { title: "Specializations", subtitle: "Curate medical services", color: "from-cyan-500 to-blue-500" },
    { title: "Reports", subtitle: "Export finance summaries", color: "from-rose-500 to-red-500" },
];

const systemAlerts = [
    { title: "Server health", status: "All services performant", severity: "success" },
    { title: "Insurance sync", status: "Scheduled for 10:30 PM IST", severity: "info" },
    { title: "Data retention", status: "Backup due in 4 hours", severity: "warning" },
];

const AdminDashboard = () => {
    const { isAdmin } = useAuth();
    const [meta, setMeta] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        pendingApprovals: 0,
        todayBookings: 0,
    });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastSynced, setLastSynced] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [approvingId, setApprovingId] = useState(null);

    const formatNumber = (value) => {
        if (value === undefined || value === null) return "—";
        return value.toLocaleString();
    };

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/doctors/admin/overview");
            setMeta(data.meta || {});
            setPendingDoctors(data.data || []);
            setLastSynced(new Date());
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load admin overview");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchOverview();
        } else {
            setError("Only admins can view this dashboard.");
            setLoading(false);
        }
    }, [isAdmin]);

    const handleApproval = async (doctorId, status) => {
        try {
            setApprovingId(`${doctorId}-${status}`);
            await api.put(`/doctors/${doctorId}/approve`, { isApproved: status });
            setPendingDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
            setActionMessage(`Doctor ${status === "approved" ? "approved" : "rejected"} successfully.`);
            fetchOverview();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update doctor status");
        } finally {
            setApprovingId(null);
        }
    };

    const quickStats = useMemo(() => ([
        {
            label: "Registered patients",
            value: formatNumber(meta.totalPatients),
            change: "Across all regions",
            accent: "from-emerald-500/15 to-transparent",
        },
        {
            label: "Active doctors",
            value: formatNumber(meta.totalDoctors),
            change: `${formatNumber(meta.pendingApprovals)} pending approval`,
            accent: "from-sky-500/15 to-transparent",
        },
        {
            label: "Today’s bookings",
            value: formatNumber(meta.todayBookings),
            change: "Within last 24h",
            accent: "from-amber-500/15 to-transparent",
        },
        {
            label: "Open approvals",
            value: formatNumber(pendingDoctors.length),
            change: "Awaiting review",
            accent: "from-rose-500/15 to-transparent",
        },
    ]), [meta, pendingDoctors.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <header className="rounded-3xl bg-slate-900 text-white p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between shadow-xl">
                    <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-white/70">Admin control center</p>
                        <h1 className="mt-4 text-4xl font-semibold">Orchestrate doctors, patients & operations from one board.</h1>
                        <p className="mt-3 text-white/70 max-w-2xl">Keep approvals flowing, analyze bookings, and respond to system alerts without leaving this screen.</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur p-5 min-w-[240px]">
                        <p className="text-sm font-medium text-white/70">Last sync</p>
                        <p className="text-2xl font-semibold">
                            {lastSynced ? lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                        <p className="text-sm text-white/70 mt-2">{loading ? "Updating overview..." : "Live cluster data"}</p>
                        <button
                            onClick={fetchOverview}
                            className="mt-4 w-full rounded-full border border-white/30 py-2 text-sm font-semibold hover:bg-white/10 transition"
                        >
                            Force refresh
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                        {error}
                    </div>
                )}
                {actionMessage && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                        {actionMessage}
                    </div>
                )}

                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {quickStats.map((stat) => (
                        <div key={stat.label} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg">
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
                            <div className="relative z-10">
                                <p className="text-sm uppercase tracking-wide text-slate-400">{stat.label}</p>
                                <p className="mt-3 text-4xl font-semibold text-slate-900">{stat.value}</p>
                                <p className="mt-2 text-sm text-slate-500">{stat.change}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-3xl bg-white shadow-xl p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900">Pending doctor approvals</h2>
                                <p className="text-sm text-slate-500">
                                    {loading ? "Loading queue..." : "Verify credentials before activating their profile."}
                                </p>
                            </div>
                            <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">View all</button>
                        </div>
                        <div className="mt-6 space-y-4">
                            {loading ? (
                                <p className="text-sm text-slate-500">Fetching doctors...</p>
                            ) : pendingDoctors.length === 0 ? (
                                <p className="text-sm text-slate-500">No doctors waiting for approval right now.</p>
                            ) : (
                                pendingDoctors.map((doctor) => (
                                    <div
                                        key={doctor._id || doctor.name}
                                        className="flex flex-col gap-3 rounded-2xl border border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between hover:border-emerald-100 transition"
                                    >
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900">{doctor.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {doctor.specialization} · {doctor.hospital?.name || doctor.hospital}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-3 py-1">
                                                {new Date(doctor.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproval(doctor._id, "approved")}
                                                    disabled={approvingId === `${doctor._id}-approved`}
                                                    className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(doctor._id, "rejected")}
                                                    disabled={approvingId === `${doctor._id}-rejected`}
                                                    className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:border-rose-400 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-white shadow-xl p-6">
                            <p className="text-sm uppercase tracking-wide text-slate-400">System alerts</p>
                            <div className="mt-4 space-y-3">
                                {systemAlerts.map((alert) => (
                                    <div key={alert.title} className="rounded-2xl border border-slate-100 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                                        <p className="text-xs text-slate-500">{alert.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl bg-slate-900 text-white p-6 space-y-4 shadow-2xl">
                            <p className="text-sm uppercase tracking-wide text-white/70">Bandwidth summary</p>
                            <p className="text-3xl font-semibold">82% utilization</p>
                            <p className="text-sm text-white/70">APAC cluster projected to peak at 95% by evening.</p>
                            <button className="w-full rounded-full bg-white/10 py-2 text-sm font-semibold hover:bg-white/20 transition">Scale resources</button>
                        </div>
                    </aside>
                </section>

                <section className="rounded-3xl bg-white shadow-xl p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">Admin actions</h2>
                            <p className="text-sm text-slate-500">Shortcuts to frequent workflows.</p>
                        </div>
                        <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400">Customize tiles</button>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {adminActions.map((action) => (
                            <button
                                key={action.title}
                                className={`rounded-3xl bg-gradient-to-br ${action.color} text-white px-6 py-6 text-left shadow-lg hover:translate-y-[-2px] transition`}
                            >
                                <p className="text-lg font-semibold">{action.title}</p>
                                <p className="text-sm text-white/80">{action.subtitle}</p>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
