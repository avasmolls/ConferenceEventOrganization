
import { useState, useEffect } from "react";

const SESSIONS_URL = "http://localhost:3001/sessions";
const REGISTRATIONS_URL = "http://localhost:3001/registrations";

const initialForm = {
  fullName: "",
  email: "",
  session: "",
  participation: "",
  notes: "",
};

async function postRegistration(payload) {
  const res = await fetch(REGISTRATIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Registration failed (${res.status})`);
  }

  return data;
}

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSessions() {
      try {
        const res = await fetch(SESSIONS_URL, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load sessions (${res.status})`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid sessions response.");
        }

        setSessions(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSessionsError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSessions(false);
        }
      }
    }

    loadSessions();
    return () => controller.abort();
  }, []);

  const selectedSession = sessions.find(
    (s) => String(s.id) === form.session
  );

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

    const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]*$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) errors.push("Name is required.");
    else if (name.length < 2) {
      errors.push("Name must be at least 2 characters.");
    } else if (!NAME_REGEX.test(name)) {
      errors.push("Name contains invalid characters.");
    }

    if (!email) errors.push("Email is required.");
    else if (!EMAIL_REGEX.test(email)) {
      errors.push("Email format is invalid.");
    }

    if (!form.session) {
      errors.push("Session selection is required.");
    } else if (!selectedSession) {
      errors.push("The selected session is not available.");
    }

    if (!["in-person", "virtual", "vip"].includes(form.participation)) {
      errors.push("Valid participation type is required.");
    }

    if (form.notes.length > 500) {
      errors.push("Notes must be 500 characters or fewer.");
    }

    if (errors.length > 0) {
      setSubmitError(errors.join(" "));
      return;
    }

    const payload = {
      fullName: name,
      email,
      session: Number(form.session),
      participation: form.participation,
      notes: form.notes.trim(),
    };

    try {
      setSubmitting(true);
      await postRegistration(payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setSubmitted(false);
    setSubmitError(null);
  };

  if (submitted) {
    return (
      <div className="container mt-4">
        <div className="alert alert-success" role="status">
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
        <div className="alert alert-danger" role="alert">
          {sessionsError}
        </div>
      )}

      {submitError && (
        <div className="alert alert-danger" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="form-control"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="session" className="form-label">
            Session
          </label>
          <select
            id="session"
            name="session"
            className="form-select"
            value={form.session}
            onChange={handleChange}
            disabled={loadingSessions || !!sessionsError || sessions.length === 0}
            required
          >
            <option value="" disabled>
              {loadingSessions
                ? "Loading sessions..."
                : sessions.length === 0
                  ? "No sessions available"
                  : "Choose a Session"}
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — ${Number(s.price || 0).toFixed(2)}
              </option>
            ))}
          </select>

          {selectedSession && (
            <div className="form-text mt-2">
              <strong>{selectedSession.category}</strong> ·{" "}
              {selectedSession.format} · Speaker:{" "}
              {selectedSession.speaker || "TBD"}
              <br />
              {selectedSession.description}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="participation" className="form-label">
            Participation Type
          </label>
          <select
            id="participation"
            name="participation"
            className="form-select"
            value={form.participation}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Choose a Type</option>
            <option value="in-person">In Person</option>
            <option value="virtual">Virtual</option>
            <option value="vip">VIP</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="notes" className="form-label">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            rows="3"
            maxLength={500}
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || loadingSessions || !!sessionsError || sessions.length === 0}
        >
          {submitting ? "Submitting..." : "Confirm Registration"}
        </button>
      </form>
    </div>
  );
}
