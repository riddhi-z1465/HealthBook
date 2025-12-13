

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const emptyQualification = { degree: "", university: "", year: "" };
const emptyExperience = { position: "", hospital: "", startDate: "", endDate: "", isCurrent: false };

const DoctorProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const doctorId = user?._id || user?.id;

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const buildFormState = useCallback((doc) => {
        if (!doc) return null;
        return {
            photo: doc.photo || "",
            name: doc.name || "",
            medicalTitle: doc.medicalTitle || "",
            specialization: doc.specialization || "",
            ticketPrice: doc.ticketPrice || "",
            bio: doc.bio || "",
            phone: doc.phone || "",
            experienceYears: doc.experienceYears || "",
            licenseNumber: doc.licenseNumber || "",
            languages: doc.languages?.join(", ") || "",
            consultationModes: doc.consultationModes?.join(", ") || "",
            hospital: {
                name: doc.hospital?.name || "",
                address: doc.hospital?.address || "",
                city: doc.hospital?.city || "",
                state: doc.hospital?.state || "",
            },
            qualifications: doc.qualifications?.length
                ? doc.qualifications.map((q) => ({
                      degree: q.degree || "",
                      university: q.university || "",
                      year: q.year || "",
                  }))
                : [emptyQualification],
            experiences: doc.experiences?.length
                ? doc.experiences.map((exp) => ({
                      position: exp.position || "",
                      hospital: exp.hospital || "",
                      startDate: exp.startDate ? exp.startDate.substring(0, 10) : "",
                      endDate: exp.endDate ? exp.endDate.substring(0, 10) : "",
                      isCurrent: exp.isCurrent || false,
                  }))
                : [emptyExperience],
        };
    }, []);

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!doctorId) {
                setError("Unable to load your profile. Please re-login.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const { data } = await api.get(`/doctors/${doctorId}`);
                setDoctor(data.data);
                setFormData(buildFormState(data.data));
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load profile right now.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [doctorId, buildFormState]);

    useEffect(() => {
        if (doctor) {
            setFormData(buildFormState(doctor));
        }
    }, [doctor, buildFormState]);

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

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleHospitalChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            hospital: {
                ...prev.hospital,
                [field]: value,
            },
        }));
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        setFormData((prev) => {
            const next = [...prev[arrayName]];
            next[index] = {
                ...next[index],
                [field]: value,
            };
            return { ...prev, [arrayName]: next };
        });
    };

    const addArrayItem = (arrayName, template) => {
        setFormData((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], template],
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setFormData((prev) => {
            if (prev[arrayName].length === 1) return prev;
            const next = prev[arrayName].filter((_, idx) => idx !== index);
            return { ...prev, [arrayName]: next };
        });
    };

    const parseCommaSeparated = (value = "") =>
        value
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!doctorId || !formData) return;
        setSaving(true);
        setSaveError(null);
        setSuccessMessage(null);
        try {
            const payload = {
                photo: formData.photo || undefined,
                name: formData.name?.trim() || undefined,
                medicalTitle: formData.medicalTitle?.trim() || undefined,
                specialization: formData.specialization?.trim() || undefined,
                ticketPrice: formData.ticketPrice ? Number(formData.ticketPrice) : undefined,
                bio: formData.bio?.trim() || undefined,
                phone: formData.phone?.trim() || undefined,
                experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
                licenseNumber: formData.licenseNumber?.trim() || undefined,
                languages: parseCommaSeparated(formData.languages),
                consultationModes: parseCommaSeparated(formData.consultationModes),
                hospital: {
                    name: formData.hospital.name?.trim() || undefined,
                    address: formData.hospital.address?.trim() || undefined,
                    city: formData.hospital.city?.trim() || undefined,
                    state: formData.hospital.state?.trim() || undefined,
                },
                qualifications: formData.qualifications
                    .filter((entry) => entry.degree?.trim() && entry.university?.trim())
                    .map((entry) => ({
                        degree: entry.degree.trim(),
                        university: entry.university.trim(),
                        year: entry.year || undefined,
                    })),
                experiences: formData.experiences
                    .filter((entry) => entry.position?.trim() && entry.hospital?.trim())
                    .map((entry) => ({
                        position: entry.position.trim(),
                        hospital: entry.hospital.trim(),
                        startDate: entry.startDate || undefined,
                        endDate: entry.isCurrent ? undefined : entry.endDate || undefined,
                        isCurrent: !!entry.isCurrent,
                    })),
            };

            const { data } = await api.put(`/doctors/${doctorId}`, payload);
            setDoctor(data.data);
            setFormData(buildFormState(data.data));
            setSuccessMessage("Profile updated successfully. Patients will now see the new details.");
            setEditing(false);
        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setSaveError(null);
        setSuccessMessage(null);
        setFormData(buildFormState(doctor));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <p className="text-slate-500">Loading your profile…</p>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center space-y-4">
                <p className="text-rose-600 font-semibold text-lg">{error || "Profile not found."}</p>
                <button
                    onClick={() => navigate("/doctor-dashboard")}
                    className="rounded-full bg-teal-600 px-6 py-2 text-white font-semibold"
                    type="button"
                >
                    Back to dashboard
                </button>
            </div>
        );
    }

    const renderQualificationsForm = () => (
        <div className="space-y-3">
            {formData.qualifications.map((entry, idx) => (
                <div key={`qual-${idx}`} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-600">
                            Degree
                            <input
                                value={entry.degree}
                                onChange={(e) => handleArrayChange("qualifications", idx, "degree", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-slate-600">
                            University / Institution
                            <input
                                value={entry.university}
                                onChange={(e) => handleArrayChange("qualifications", idx, "university", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                            />
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex-1 text-sm font-semibold text-slate-600">
                            Graduation year (optional)
                            <input
                                type="number"
                                value={entry.year}
                                onChange={(e) => handleArrayChange("qualifications", idx, "year", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                            />
                        </label>
                        {formData.qualifications.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeArrayItem("qualifications", idx)}
                                className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem("qualifications", emptyQualification)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                + Add qualification
            </button>
        </div>
    );

    const renderExperienceForm = () => (
        <div className="space-y-3">
            {formData.experiences.map((entry, idx) => (
                <div key={`exp-${idx}`} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-600">
                            Position / Role
                            <input
                                value={entry.position}
                                onChange={(e) => handleArrayChange("experiences", idx, "position", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-slate-600">
                            Hospital / Clinic
                            <input
                                value={entry.hospital}
                                onChange={(e) => handleArrayChange("experiences", idx, "hospital", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                            />
                        </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <label className="block text-sm font-semibold text-slate-600">
                            Start date
                            <input
                                type="date"
                                value={entry.startDate}
                                onChange={(e) => handleArrayChange("experiences", idx, "startDate", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-slate-600">
                            End date
                            <input
                                type="date"
                                disabled={entry.isCurrent}
                                value={entry.endDate}
                                onChange={(e) => handleArrayChange("experiences", idx, "endDate", e.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none disabled:bg-slate-50"
                            />
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <input
                                type="checkbox"
                                checked={entry.isCurrent}
                                onChange={(e) => handleArrayChange("experiences", idx, "isCurrent", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Currently working here
                        </label>
                    </div>
                    {formData.experiences.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeArrayItem("experiences", idx)}
                            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
                        >
                            Remove experience
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem("experiences", emptyExperience)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                + Add experience
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={() => navigate("/doctor-dashboard")}
                        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
                        type="button"
                    >
                        ← Back to dashboard
                    </button>
                    {!editing ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                type="button"
                            >
                                Edit profile
                            </button>
                            <button
                                onClick={() => navigate("/doctor/schedule")}
                                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                                type="button"
                            >
                                Manage schedule
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCancel}
                                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
                                type="button"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                type="submit"
                                form="doctor-profile-form"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save profile"}
                            </button>
                        </div>
                    )}
                </div>

                {(successMessage || saveError) && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            successMessage
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                    >
                        {successMessage || saveError}
                    </div>
                )}

                {!editing && (
                    <>
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
                                        {doctor.bio || "Add a short bio describing your care philosophy and focus areas."}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                                            ⭐ {doctor.averageRating ? doctor.averageRating.toFixed(1) : "—"} ({doctor.totalRating || 0} reviews)
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                                            🕒 {yearsOfExperience ? `${yearsOfExperience}+ yrs experience` : "Experience info unavailable"}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                                            💳 {doctor.ticketPrice ? `₹${doctor.ticketPrice.toLocaleString()}` : "Fee on request"}
                                        </span>
                                    </div>
                                </div>
                            </div>
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
                                                : "Add your medical degrees and universities attended."}
                                        </dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-400">Medical license</dt>
                                            <dd className="mt-1 text-sm text-slate-700">
                                                {doctor.licenseNumber || "Not provided"}
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
                                                : "Add fellowships, board certifications, or noteworthy credentials."}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-slate-900">Clinic & location</h2>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <p className="text-lg font-semibold text-slate-900">{doctor.hospital?.name || "Clinic name pending"}</p>
                                    <p>{doctor.hospital?.address || "Add your clinic or hospital address."}</p>
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
                                <p className="text-sm text-slate-500">Document your previous roles to help patients understand your background.</p>
                            )}
                        </section>
                    </>
                )}

                {editing && (
                    <form id="doctor-profile-form" className="space-y-8" onSubmit={handleSubmit}>
                        <section className="rounded-3xl bg-white shadow-2xl p-6 md:p-8 space-y-6">
                            <h2 className="text-2xl font-semibold text-slate-900">Basic information</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-semibold text-slate-600">
                                    Full name
                                    <input
                                        value={formData.name}
                                        onChange={(e) => handleFieldChange("name", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Consultation title
                                    <input
                                        value={formData.medicalTitle}
                                        onChange={(e) => handleFieldChange("medicalTitle", e.target.value)}
                                        placeholder="e.g. MD, MS, Consultant Pediatrician"
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Specialization
                                    <input
                                        value={formData.specialization}
                                        onChange={(e) => handleFieldChange("specialization", e.target.value)}
                                        placeholder="Cardiologist, Pediatrician..."
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Consultation fee (₹)
                                    <input
                                        type="number"
                                        value={formData.ticketPrice}
                                        onChange={(e) => handleFieldChange("ticketPrice", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Years of experience
                                    <input
                                        type="number"
                                        value={formData.experienceYears}
                                        onChange={(e) => handleFieldChange("experienceYears", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Medical license number
                                    <input
                                        value={formData.licenseNumber}
                                        onChange={(e) => handleFieldChange("licenseNumber", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-semibold text-slate-600">
                                    Languages (comma separated)
                                    <input
                                        value={formData.languages}
                                        onChange={(e) => handleFieldChange("languages", e.target.value)}
                                        placeholder="English, Hindi, Bengali"
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Consultation modes (comma separated)
                                    <input
                                        value={formData.consultationModes}
                                        onChange={(e) => handleFieldChange("consultationModes", e.target.value)}
                                        placeholder="In-clinic, Online"
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                            </div>
                            <label className="text-sm font-semibold text-slate-600">
                                Bio / about
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                />
                            </label>
                            <label className="text-sm font-semibold text-slate-600">
                                Profile photo URL
                                <input
                                    value={formData.photo}
                                    onChange={(e) => handleFieldChange("photo", e.target.value)}
                                    placeholder="https://..."
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                />
                            </label>
                            <label className="text-sm font-semibold text-slate-600">
                                Contact phone
                                <input
                                    value={formData.phone}
                                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                />
                            </label>
                        </section>

                        <section className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-slate-900">Clinic & location</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-semibold text-slate-600">
                                    Clinic / Hospital name
                                    <input
                                        value={formData.hospital.name}
                                        onChange={(e) => handleHospitalChange("name", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    Street address
                                    <input
                                        value={formData.hospital.address}
                                        onChange={(e) => handleHospitalChange("address", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    City
                                    <input
                                        value={formData.hospital.city}
                                        onChange={(e) => handleHospitalChange("city", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                                <label className="text-sm font-semibold text-slate-600">
                                    State / Region
                                    <input
                                        value={formData.hospital.state}
                                        onChange={(e) => handleHospitalChange("state", e.target.value)}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
                                    />
                                </label>
                            </div>
                        </section>

                        <section className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-slate-900">Medical qualifications</h2>
                            {renderQualificationsForm()}
                        </section>

                        <section className="rounded-3xl bg-white shadow-xl p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-slate-900">Experience</h2>
                            {renderExperienceForm()}
                        </section>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DoctorProfile;
