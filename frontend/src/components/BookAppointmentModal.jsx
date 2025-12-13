import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { api } from "../context/AuthContext";

const STEP_FORM = "form";
const STEP_CONFIRM = "confirm";
const STEP_SUCCESS = "success";

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const getDayName = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });

const createCalendarFile = (booking, doctor, slotDuration = 30) => {
    if (!booking) return null;
    const start = new Date(`${booking.appointmentDate}T${booking.appointmentTime}:00`);
    const end = new Date(start.getTime() + slotDuration * 60000);
    const formatICSDate = (date) =>
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const description = `Consultation with ${doctor?.name}${booking.reasonForVisit ? ` – Reason: ${booking.reasonForVisit}` : ""}`;
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//HealthBook//Doctor Appointment//EN",
        "BEGIN:VEVENT",
        `UID:${booking._id}@healthbook`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:Appointment with ${doctor?.name}`,
        `DESCRIPTION:${description}`,
        doctor?.hospital?.address ? `LOCATION:${doctor.hospital.address}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
        .filter(Boolean)
        .join("\n");
};

const BookAppointmentModal = ({ doctor, open, onClose, onBooked }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEP_FORM);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successBooking, setSuccessBooking] = useState(null);

    const allowedDays = useMemo(() => new Set(doctor?.timeSlots?.map((slot) => slot.day) || []), [doctor]);
    const selectedDayName = useMemo(
        () => (appointmentDate ? getDayName(`${appointmentDate}T00:00:00Z`) : null),
        [appointmentDate]
    );
    const slotDuration = useMemo(() => {
        if (!selectedDayName) return 30;
        return doctor?.timeSlots?.find((slot) => slot.day === selectedDayName)?.slotDuration || 30;
    }, [doctor, selectedDayName]);

    useEffect(() => {
        if (!open) return;
        setStep(STEP_FORM);
        setAppointmentDate("");
        setSlots([]);
        setSelectedSlot("");
        setReason("");
        setError(null);
        setSubmitting(false);
        setSuccessBooking(null);
    }, [open, doctor?._id]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!appointmentDate || !doctor?._id) return;
            const dayName = getDayName(`${appointmentDate}T00:00:00Z`);
            if (!allowedDays.has(dayName)) {
                setSlots([]);
                setError(`Dr. ${doctor.name} is unavailable on ${dayName}. Please choose another day.`);
                return;
            }

            setLoadingSlots(true);
            setError(null);
            try {
                const { data } = await api.get("/bookings/check-availability", {
                    params: {
                        doctorId: doctor._id,
                        date: appointmentDate,
                    },
                });
                setSlots(data.slots || []);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to fetch available time slots.");
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [appointmentDate, doctor?._id, allowedDays, doctor?.name]);

    const handleConfirm = async () => {
        try {
            setSubmitting(true);
            setError(null);
            const payload = {
                doctor: doctor._id,
                appointmentDate,
                appointmentTime: selectedSlot,
                ticketPrice: doctor.ticketPrice,
                reasonForVisit: reason.trim() ? reason.trim() : undefined,
            };
            const { data } = await api.post("/bookings", payload);
            setSuccessBooking(data.data);
            setStep(STEP_SUCCESS);
            onBooked?.(data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to confirm appointment right now.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddToCalendar = () => {
        const ics = createCalendarFile(successBooking || { appointmentDate, appointmentTime: selectedSlot }, doctor, slotDuration);
        if (!ics) return;
        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `appointment-${doctor?._id}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const disableContinue = !appointmentDate || !selectedSlot || loadingSlots;

    if (!open || !doctor) {
        return null;
    }

    const renderedStep = () => {
        if (step === STEP_SUCCESS) {
            return (
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-4xl">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900">Appointment confirmed successfully</h3>
                        <p className="mt-2 text-gray-600">
                            You’ll receive reminders before the consultation. You can review all your bookings in “My Appointments”.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                handleAddToCalendar();
                            }}
                            className="w-full rounded-full border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Add to calendar
                        </button>
                        <button
                            onClick={() => navigate("/patient-dashboard")}
                            className="w-full rounded-full bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700"
                        >
                            View appointments
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full rounded-full border border-transparent py-3 font-semibold text-gray-500 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            );
        }

        if (step === STEP_CONFIRM) {
            return (
                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Confirmation</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">Review appointment details</h3>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Doctor</span>
                            <span className="font-semibold text-gray-900">{doctor.name}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Specialty</span>
                            <span className="font-semibold text-gray-900">{doctor.specialization}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Date</span>
                            <span className="font-semibold text-gray-900">
                                {new Date(appointmentDate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Time</span>
                            <span className="font-semibold text-gray-900">{selectedSlot}</span>
                        </div>
                        {reason && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Reason</span>
                                <span className="text-right font-semibold text-gray-900">{reason}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Consultation fee</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(doctor.ticketPrice)}</span>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={() => setStep(STEP_FORM)}
                            className="flex-1 rounded-full border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                            type="button"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="flex-1 rounded-full bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                            type="button"
                        >
                            {submitting ? "Confirming…" : "Confirm appointment"}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                        {doctor.photo ? (
                            <img src={doctor.photo} alt={doctor.name} className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                            <span className="text-2xl font-semibold text-teal-600">{doctor.name?.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-wide text-teal-600">Booking for</p>
                        <h3 className="text-2xl font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialization}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-semibold text-gray-700">Preferred date</span>
                        <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={appointmentDate}
                            onChange={(e) => {
                                setAppointmentDate(e.target.value);
                                setSelectedSlot("");
                                setSlots([]);
                                setError(null);
                            }}
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                        />
                        <span className="mt-1 block text-xs text-gray-500">
                            Available days: {[...allowedDays].join(", ") || "Doctor schedule not provided"}
                        </span>
                    </label>

                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Time slots</span>
                            {loadingSlots && <span className="text-xs text-gray-500">Checking availability…</span>}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3">
                            {slots.length === 0 && appointmentDate && !loadingSlots ? (
                                <p className="col-span-3 text-sm text-gray-500">
                                    {selectedDayName && allowedDays.has(selectedDayName)
                                        ? "No slots left for this day. Pick another date."
                                        : "Doctor unavailable on this day."}
                                </p>
                            ) : (
                                slots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlot(slot.time)}
                                        className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                                            selectedSlot === slot.time
                                                ? "border-transparent bg-teal-600 text-white"
                                                : slot.available
                                                    ? "border-gray-200 text-gray-700 hover:border-teal-500"
                                                    : "border-gray-100 text-gray-400 line-through cursor-not-allowed"
                                        }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <label className="block">
                        <span className="text-sm font-semibold text-gray-700">Reason for visit (optional)</span>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Eg. Follow-up on test results, recurring headache, etc."
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </label>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-full border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setStep(STEP_CONFIRM)}
                        disabled={disableContinue}
                        className="flex-1 rounded-full bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                        type="button"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 px-4 py-6 sm:items-center sm:p-6">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                    onClick={onClose}
                    type="button"
                >
                    ✕
                </button>
                {renderedStep()}
            </div>
        </div>
    );
};

BookAppointmentModal.propTypes = {
    doctor: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onBooked: PropTypes.func,
};

export default BookAppointmentModal;
