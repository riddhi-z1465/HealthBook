import { useState } from "react";

const contactChannels = [
    {
        title: "Emergency Care",
        detail: "+91 8822 00 55 44",
        badge: "24/7 hotline",
    },
    {
        title: "Appointments",
        detail: "care@healthbook.com",
        badge: "Replies within 2 hours",
    },
    {
        title: "Visit us",
        detail: "45 HealthBook Blvd, Pune",
        badge: "Mon – Sat, 9am – 8pm",
    },
];

const supportStats = [
    { label: "Avg. response", value: "12 min" },
    { label: "Clinics worldwide", value: "32" },
    { label: "Specialists on call", value: "140+" },
];

const initialFormState = {
    name: "",
    email: "",
    phone: "",
    reason: "general",
    message: "",
};

const Contact = () => {
    const [form, setForm] = useState(initialFormState);
    const [sent, setSent] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSent(true);
        setForm(initialFormState);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-emerald-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
                <div className="text-center space-y-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 font-semibold">Talk to our care desk</p>
                    <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900">We’re here for every appointment, emergency, and update</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Reach our integrated care team to schedule specialist visits, get medical records, or coordinate home consultations.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl bg-white shadow-xl p-8 flex flex-col gap-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-slate-900">Contact options</h2>
                            <p className="text-sm text-slate-500">Choose the channel that fits the urgency of your request.</p>
                        </div>

                        <div className="grid gap-4">
                            {contactChannels.map((channel) => (
                                <div key={channel.title} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 hover:border-emerald-100 transition">
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-slate-400">{channel.title}</p>
                                        <p className="text-lg font-semibold text-slate-900">{channel.detail}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1">{channel.badge}</span>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl bg-slate-900 text-white p-6 space-y-4">
                            <p className="text-sm uppercase tracking-wide text-white/60">Response Snapshot</p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {supportStats.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-3xl font-semibold">{stat.value}</p>
                                        <p className="text-sm text-white/70">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-dashed border-emerald-200 p-6">
                            <p className="text-sm font-semibold text-emerald-700 mb-2">Need directions?</p>
                            <p className="text-sm text-slate-500">Our flagship campus is 15 minutes from Pune International Airport and offers valet parking.</p>
                            <button className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700">Open on Maps →</button>
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white shadow-xl p-8">
                        <div className="space-y-2 mb-6">
                            <h2 className="text-2xl font-semibold text-slate-900">Send us a message</h2>
                            <p className="text-sm text-slate-500">Share a brief note and the right coordinator will reply shortly.</p>
                        </div>

                        {sent && (
                            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                We received your message. Expect a response soon.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="text-sm font-semibold text-slate-600">Full name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-400 focus:outline-none"
                                        placeholder="Navya Sharma"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-semibold text-slate-600">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-400 focus:outline-none"
                                        placeholder="navya@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="phone" className="text-sm font-semibold text-slate-600">Phone (optional)</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-400 focus:outline-none"
                                        placeholder="+91 9000 000 000"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reason" className="text-sm font-semibold text-slate-600">Topic</label>
                                    <select
                                        id="reason"
                                        name="reason"
                                        value={form.reason}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-400 focus:outline-none"
                                    >
                                        <option value="general">General enquiry</option>
                                        <option value="appointment">Book an appointment</option>
                                        <option value="records">Medical records</option>
                                        <option value="billing">Billing & insurance</option>
                                        <option value="feedback">Feedback</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="text-sm font-semibold text-slate-600">How can we help?</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    value={form.message}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-emerald-400 focus:outline-none resize-none"
                                    placeholder="Share any context, symptoms, preferred doctors, or dates."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition"
                            >
                                Send message
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Contact;
