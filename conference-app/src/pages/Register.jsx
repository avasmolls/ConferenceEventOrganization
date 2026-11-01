import { useState, useEffect } from "react";

// Configuration

const SESSIONS_URL = "/sessions.json";
const REGISTRATIONS_URL = "http://localhost:3001/registrations"; // will be replaced with our api I just have it set to my local host for now
const LOCAL_STORAGE_KEY = "conferenceRegistrations";

const initialForm = {
    fullName: "",
    email: "",
    session: "",
    participation: "",
    notes: "",
};

// Service layer

async function postRegistration(payload) {
    // add JSON/AJAX --> get ready to send to API but currently we are only using local storage
}

// Component
export default function Register() {
    // Form state
    const [form, setForm] = useState(initialForm);

    // (GET) state
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sessionsError, setSessionsError] = useState(null);

    // (POST) state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // GET sessions
    useEffect(() => {
        const controller = new AbortController();

        async function loadSessions() {
            try {
                const res = await fetch(SESSIONS_URL, { signal: controller.signal });
                if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`);
                const data = await res.json();
                setSessions(data);
            }
            catch (err) {
                if (err.name !== "AbortError") setSessionsError(err.message);
            }
            finally {
                if (!controller.signal.aborted) setLoadingSessions(false);
            }
        }

        loadSessions();
        return () => controller.abort();
    }, []);

    const selectedSession = sessions.find((s) => String(s.id) === form.session);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        const name = form.fullName.trim();
        const email = form.email.trim().toLowerCase();
        const errors = [];

        //Regex
        const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]*$/;
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

        //Name
        if (!name) errors.push("Name is required.");
        else if (name.length < 2) errors.push("Name must be at least 2 characters.");
        else if (!NAME_REGEX.test(name)) errors.push("Name contains invalid characters.");

        //Email
        if (!email) errors.push("Email is required.");
        else if (!EMAIL_REGEX.test(email)) errors.push("Email format is invalid.");

        //Session
        if (!form.session) errors.push("Session selection is required.");
        else if (!sessions.some((s) => String(s.id) === form.session)) errors.push("The selected session is not available.");

        //Participation
        if (!form.participation) errors.push("Participation type is required.");
        else if (!["in-person", "virtual", "vip"].includes(form.participation)) errors.push("Invalid participation type.");

        // Notes
        if (form.notes.length > 500) errors.push("Notes must be 500 characters or fewer.");

        if (errors.length > 0) {
            setSubmitError(errors.join(" "));
            return;
        }

        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        if (existing.some((r) => r.email === email && r.session === form.session)) {
            setSubmitError("This email is already registered for that session.");
            return;
        }
        const payload = {
            fullName: name,
            email,
            session: form.session,
            participation: form.participation,
            notes: form.notes.trim(),
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, payload]));
        setSubmitted(true);
    };

    const handleReset = () => {
        setForm(initialForm);
        setSubmitted(false);
        setSubmitError(null);
    };

    if (submitted) {
        return (
            <div className="container mt-4">
                <div className="alert alert-success">
                    Thanks, {form.fullName}! You're registered for{" "}
                    <strong>{selectedSession?.title}</strong>.
                </div>
                <button className="btn btn-secondary" onClick={handleReset}>
                    Register Another Person
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Conference Registration</h2>

            {sessionsError && (
                <div className="alert alert-danger">{sessionsError}</div>
            )}
            {submitError && (
                <div className="alert alert-danger">{submitError}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input id="fullName" name="fullName" type="text"
                        className="form-control" value={form.fullName}
                        onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input id="email" name="email" type="email"
                        className="form-control" value={form.email}
                        onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label htmlFor="session" className="form-label">Session</label>
                    <select id="session" name="session" className="form-select"
                        value={form.session} onChange={handleChange}
                        disabled={loadingSessions || !!sessionsError} required>
                        <option value="" disabled>
                            {loadingSessions ? "Loading sessions..." : "Choose a Session"}
                        </option>
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title} — ${s.price.toFixed(2)}
                            </option>
                        ))}
                    </select>

                    {selectedSession && (
                        <div className="form-text mt-2">
                            <strong>{selectedSession.category}</strong> ·{" "}
                            {selectedSession.format} · Speaker: {selectedSession.speaker}
                            <br />
                            {selectedSession.description}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="participation" className="form-label">Participation Type</label>
                    <select id="participation" name="participation" className="form-select"
                        value={form.participation} onChange={handleChange} required>
                        <option value="" disabled>Choose a Type</option>
                        <option value="in-person">In Person</option>
                        <option value="virtual">Virtual</option>
                        <option value="vip">VIP</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Additional Notes</label>
                    <textarea id="notes" name="notes" className="form-control"
                        rows="3" value={form.notes} onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-primary"
                    disabled={submitting || loadingSessions}>
                    {submitting ? "Submitting..." : "Confirm Registration"}
                </button>
            </form>
        </div>
    );
}