import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const slotDurationOptions = [15, 30, 45, 60];

const createBlankSchedule = () =>
    daysOfWeek.reduce((acc, day) => {
        acc[day] = {
            enabled: false,
            startTime: "09:00",
            endTime: "17:00",
            slotDuration: 30,
        };
        return acc;
    }, {});

const statusStyles = {
    available: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    booked: "bg-rose-50 text-rose-700 border border-rose-100",
    blocked: "bg-slate-100 text-slate-600 border border-slate-200",
};

const DoctorSchedule = () => {
    const { user } = useAuth();
    const doctorId = user?._id || user?.id;
    const navigate = useNavigate();

    const [scheduleConfig, setScheduleConfig] = useState(createBlankSchedule);
    const [blockedDates, setBlockedDates] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [newBlockDate, setNewBlockDate] = useState("");
    const [newBlockReason, setNewBlockReason] = useState("");
    const [baseline, setBaseline] = useState({ timeSlots: [], unavailableDates: [] });

    const updateDayConfig = (day, field, value) => {
        setScheduleConfig((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const applyScheduleFromResponse = useCallback((timeSlots = [], unavailableDates = []) => {
        const fresh = createBlankSchedule();
        timeSlots.forEach((slot) => {
            if (fresh[slot.day]) {
                fresh[slot.day] = {
                    enabled: true,
                    startTime: slot.startTime || "09:00",
                    endTime: slot.endTime || "17:00",
                    slotDuration: slot.slotDuration || 30,
                };
            }
        });
        setScheduleConfig(fresh);
        setBlockedDates(
            (unavailableDates || []).map((entry) => {
                const iso = entry?.date ? entry.date : entry;
                const normalized = iso ? new Date(iso).toISOString().split("T")[0] : "";
                return {
                    date: normalized,
                    reason: entry?.reason || "",
                };
            })
        );
        setBaseline({
            timeSlots,
            unavailableDates,
        });
    }, []);

    const loadSchedule = useCallback(async () => {
        if (!doctorId) return;
        try {
            setLoading(true);
            const [profileRes, bookingsRes] = await Promise.all([api.get(`/doctors/${doctorId}`), api.get("/bookings")]);
            const doctorProfile = profileRes.data?.data;
            applyScheduleFromResponse(doctorProfile?.timeSlots || [], doctorProfile?.unavailableDates || []);

            const upcomingBookings = Array.isArray(bookingsRes.data?.data)
                ? bookingsRes.data.data.filter((booking) => {
                      const bookingDoctorId = booking.doctor?._id || booking.doctor;
                      if (!bookingDoctorId) return false;
                      return bookingDoctorId.toString() === doctorId.toString();
                  })
                : [];

            setAppointments(upcomingBookings);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load schedule data.");
        } finally {
            setLoading(false);
        }
    }, [applyScheduleFromResponse, doctorId]);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    const handleAddBlockedDate = () => {
        if (!newBlockDate) return;
        setBlockedDates((prev) => {
            if (prev.some((entry) => entry.date === newBlockDate)) {
                return prev;
            }
            return [...prev, { date: newBlockDate, reason: newBlockReason.trim() }];
        });
        setNewBlockDate("");
        setNewBlockReason("");
    };

    const handleRemoveBlockedDate = (dateToRemove) => {
        setBlockedDates((prev) => prev.filter((entry) => entry.date !== dateToRemove));
    };

    const validationErrors = useMemo(() => {
        const issues = [];
        daysOfWeek.forEach((day) => {
            const config = scheduleConfig[day];
            if (config.enabled) {
                if (config.startTime >= config.endTime) {
                    issues.push(`${day}: End time must be later than start time.`);
                }
            }
        });
        return issues;
    }, [scheduleConfig]);

    const compiledPayload = useMemo(() => {
        const timeSlots = daysOfWeek
            .filter((day) => scheduleConfig[day].enabled)
            .map((day) => ({
                day,
                startTime: scheduleConfig[day].startTime,
                endTime: scheduleConfig[day].endTime,
                slotDuration: scheduleConfig[day].slotDuration,
            }));

        const unavailableDates = blockedDates
            .filter((entry) => entry.date)
            .map((entry) => ({
                date: entry.date,
                reason: entry.reason?.trim() || undefined,
            }));

        return { timeSlots, unavailableDates };
    }, [scheduleConfig, blockedDates]);

    const handleSaveSchedule = async () => {
        if (!doctorId || validationErrors.length) return;
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);
            const response = await api.put(`/doctors/${doctorId}/schedule`, compiledPayload);
            const updatedDoctor = response.data?.data;
            applyScheduleFromResponse(updatedDoctor?.timeSlots || compiledPayload.timeSlots, updatedDoctor?.unavailableDates || compiledPayload.unavailableDates);
            setSuccess("Schedule updated successfully. Patients can now book you.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save schedule. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        applyScheduleFromResponse(baseline.timeSlots || [], baseline.unavailableDates || []);
        setSuccess(null);
        setError(null);
    };

    const previewSlots = useMemo(() => {
        const days = [];
        const today = new Date();

        for (let offset = 0; offset < 7; offset++) {
            const date = new Date(today);
            date.setDate(today.getDate() + offset);
            const isoDate = date.toISOString().split("T")[0];
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
            const config = scheduleConfig[dayName];

            if (!config?.enabled) continue;

            const isBlocked = blockedDates.some((entry) => entry.date === isoDate);

            const slots = [];
            if (!isBlocked) {
                const [startHour, startMinute] = config.startTime.split(":").map(Number);
                const [endHour, endMinute] = config.endTime.split(":").map(Number);

                const current = new Date(date);
                current.setHours(startHour, startMinute, 0, 0);

                const end = new Date(date);
                end.setHours(endHour, endMinute, 0, 0);

                while (current < end) {
                    const time = current.toTimeString().slice(0, 5);
                    const booked = appointments.some((appointment) => {
                        const appointmentDate = new Date(appointment.appointmentDate);
                        const appointmentDateIso = appointmentDate.toISOString().split("T")[0];
                        return (
                            appointmentDateIso === isoDate &&
                            appointment.appointmentTime === time &&
                            ["pending", "approved"].includes(appointment.status)
                        );
                    });
                    slots.push({
                        time,
                        status: booked ? "booked" : "available",
                    });
                    current.setMinutes(current.getMinutes() + (config.slotDuration || 30));
                }
            }

            days.push({
                iso: isoDate,
                label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                status: isBlocked ? "blocked" : "open",
                slots,
            });
        }

        return days;
    }, [appointments, blockedDates, scheduleConfig]);

    const upcomingAppointments = useMemo(() => {
        const now = new Date();
        return appointments
            .filter((appointment) => {
                const appointmentDate = new Date(appointment.appointmentDate);
                return appointmentDate >= now;
            })
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
            .slice(0, 5);
    }, [appointments]);

    if (!doctorId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-600">You must be signed in as a doctor to manage your schedule.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-emerald-500">Schedule studio</p>
                        <h1 className="text-4xl font-bold text-slate-900 mt-1">Manage your weekly availability</h1>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                            Craft a weekly rhythm, preview live slots, and block off time in seconds. Patients see changes instantly.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/doctor-dashboard")}
                        className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                        type="button"
                    >
                        Back to dashboard
                    </button>
                </div>

                {(error || success) && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                        {error || success}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-3xl bg-white shadow-xl p-12 text-center text-slate-500">Loading your schedule…</div>
                ) : (
                    <>
                        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                            <div className="rounded-3xl bg-white shadow-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-slate-900">Weekly availability</h2>
                                        <p className="text-sm text-slate-500">Toggle active days and fine-tune start/end times.</p>
                                    </div>
                                    <div className="text-xs uppercase tracking-wide text-slate-400">
                                        Slot length: per-day control
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {daysOfWeek.map((day) => (
                                        <div
                                            key={day}
                                            className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 md:flex-row md:items-center md:gap-6 ${
                                                scheduleConfig[day].enabled ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100"
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => updateDayConfig(day, "enabled", !scheduleConfig[day].enabled)}
                                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                    scheduleConfig[day].enabled ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {day}
                                            </button>
                                            <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
                                                <label className="flex items-center gap-2">
                                                    <span className="text-slate-500">Start</span>
                                                    <input
                                                        type="time"
                                                        disabled={!scheduleConfig[day].enabled}
                                                        value={scheduleConfig[day].startTime}
                                                        onChange={(e) => updateDayConfig(day, "startTime", e.target.value)}
                                                        className="rounded-full border border-slate-200 px-3 py-1.5"
                                                    />
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <span className="text-slate-500">End</span>
                                                    <input
                                                        type="time"
                                                        disabled={!scheduleConfig[day].enabled}
                                                        value={scheduleConfig[day].endTime}
                                                        onChange={(e) => updateDayConfig(day, "endTime", e.target.value)}
                                                        className="rounded-full border border-slate-200 px-3 py-1.5"
                                                    />
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <span className="text-slate-500">Slot</span>
                                                    <select
                                                        disabled={!scheduleConfig[day].enabled}
                                                        value={scheduleConfig[day].slotDuration}
                                                        onChange={(e) => updateDayConfig(day, "slotDuration", Number(e.target.value))}
                                                        className="rounded-full border border-slate-200 px-3 py-1.5"
                                                    >
                                                        {slotDurationOptions.map((duration) => (
                                                            <option key={duration} value={duration}>
                                                                {duration} min
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {validationErrors.length > 0 && (
                                    <ul className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                        {validationErrors.map((issue) => (
                                            <li key={issue}>{issue}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-3xl bg-white shadow-xl p-6">
                                    <h3 className="text-lg font-semibold text-slate-900">Block / unblock dates</h3>
                                    <p className="text-sm text-slate-500">Add leaves, conferences, or days off.</p>
                                    <div className="mt-4 space-y-3">
                                        <input
                                            type="date"
                                            value={newBlockDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) => setNewBlockDate(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 px-3 py-2"
                                        />
                                        <input
                                            type="text"
                                            value={newBlockReason}
                                            onChange={(e) => setNewBlockReason(e.target.value)}
                                            placeholder="Reason (optional)"
                                            className="w-full rounded-2xl border border-slate-200 px-3 py-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddBlockedDate}
                                            disabled={!newBlockDate}
                                            className="w-full rounded-full bg-slate-900 py-2 text-sm font-semibold text-white disabled:opacity-40"
                                        >
                                            Block this day
                                        </button>
                                    </div>
                                    <div className="mt-6 space-y-2 max-h-48 overflow-y-auto">
                                        {blockedDates.length === 0 ? (
                                            <p className="text-sm text-slate-500">No blocked dates.</p>
                                        ) : (
                                            blockedDates.map((entry) => (
                                                <div key={entry.date} className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {new Date(entry.date).toLocaleDateString("en-US", {
                                                                weekday: "short",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </p>
                                                        {entry.reason && <p className="text-xs text-slate-500">{entry.reason}</p>}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveBlockedDate(entry.date)}
                                                        className="text-xs font-semibold text-rose-500"
                                                        type="button"
                                                    >
                                                        Unblock
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl">
                                    <h3 className="text-lg font-semibold">Upcoming bookings</h3>
                                    <p className="text-sm text-white/70">Reference-only view</p>
                                    <div className="mt-4 space-y-3">
                                        {upcomingAppointments.length === 0 ? (
                                            <p className="text-sm text-white/70">No upcoming appointments.</p>
                                        ) : (
                                            upcomingAppointments.map((appointment) => (
                                                <div key={appointment._id} className="rounded-2xl bg-white/10 px-4 py-3">
                                                    <p className="text-sm font-semibold">{appointment.user?.name}</p>
                                                    <p className="text-xs text-white/70">
                                                        {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}{" "}
                                                        • {appointment.appointmentTime}
                                                    </p>
                                                    <span
                                                        className="mt-2 inline-flex rounded-full bg-white/15 px-2 py-1 text-xs uppercase tracking-wide"
                                                    >
                                                        {appointment.status}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                            <div className="rounded-3xl bg-white shadow-xl p-6">
                                <div className="flex flex-col gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold text-slate-900">Live slot preview</h2>
                                    <p className="text-sm text-slate-500">
                                        Generated from your weekly configuration. Booked slots pull from confirmed appointments.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-5">
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                        Available
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded-full bg-rose-400" />
                                        Booked
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded-full bg-slate-400" />
                                        Blocked
                                    </span>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {previewSlots.length === 0 ? (
                                        <p className="text-sm text-slate-500 col-span-2">Enable days to preview generated slots.</p>
                                    ) : (
                                        previewSlots.map((day) => (
                                            <div key={day.iso} className="rounded-2xl border border-slate-100 p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                                                        <p className="text-xs text-slate-500">{day.iso}</p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            day.status === "blocked"
                                                                ? "bg-slate-100 text-slate-600"
                                                                : "bg-emerald-50 text-emerald-600"
                                                        }`}
                                                    >
                                                        {day.status === "blocked" ? "Blocked" : "Open"}
                                                    </span>
                                                </div>
                                                {day.status === "blocked" ? (
                                                    <p className="text-xs text-slate-500">All slots blocked.</p>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        {day.slots.map((slot) => (
                                                            <div
                                                                key={`${day.iso}-${slot.time}`}
                                                                className={`rounded-full px-3 py-2 text-center ${statusStyles[slot.status]}`}
                                                            >
                                                                {slot.time}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white shadow-xl p-6 flex flex-col gap-3">
                                <h3 className="text-xl font-semibold text-slate-900">Save & Publish</h3>
                                <p className="text-sm text-slate-500">
                                    We&apos;ll validate conflicts before publishing. Patients will see updates instantly.
                                </p>
                                <button
                                    onClick={handleSaveSchedule}
                                    disabled={saving || validationErrors.length > 0}
                                    className="mt-4 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                    type="button"
                                >
                                    {saving ? "Publishing…" : "Save & Publish"}
                                </button>
                                <button
                                    onClick={handleReset}
                                    disabled={saving}
                                    className="rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                                    type="button"
                                >
                                    Reset to last saved
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorSchedule;
