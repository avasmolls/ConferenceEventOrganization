import { useState } from "react";

// Configuration
const USE_API = false; // set to true to use the API instead of local storage

const SUBMISSIONS_URL = "http://localhost:3001/submissions";
const LOCAL_STORAGE_KEY = "conferenceSubmissions";

const CATEGORIES = ["Keynote", "Workshop", "Panel", "Lightning Talk", "Technology", "Other"];

const initialForm = {
  title: "",
  speaker: "",
  email: "",
  category: "",
  abstract: "",
};

// Service layer

async function postSubmission(payload) {
  if (USE_API) {
    const res = await fetch(SUBMISSIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Registration failed (${res.status})`);
    return res.json();
  }

  // Local fallback: simulate network latency and save to localStorage
  await new Promise((resolve) => setTimeout(resolve, 600));
  const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  const saved = {
    id: Date.now(),
    ...payload,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, saved]));
  return saved;
}

// Component
export default function Submissions() {
  // Form state
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm(initialForm);
    setSubmitted(false);
    setSubmitError(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    // Validation
    const newErrors = {};
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const TITLE_REGEX = /^[a-zA-Z0-9\s]+$/;

    if (!form.title.trim()) {
      newErrors.title = "Session title is required.";
    } else if (!TITLE_REGEX.test(form.email.trim())) {
      newErrors.title = "Session title can only contain letters, numbers, and spaces.";
    }

    if (!form.speaker.trim()) {
      newErrors.speaker = "Speaker name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Speaker email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.category) {
      newErrors.category = "Please choose a category.";
    } else if (!CATEGORIES.includes(form.category)) {
      newErrors.category = "Invalid category selected.";
    }

    if (!form.abstract.trim()) {
      newErrors.abstract = "Session abstract is required.";
    } else if (form.abstract.trim().length < 20) {
      newErrors.abstract = "Abstract must be at least 20 characters.";
    }

    setErrors(newErrors);

    // Stop if there are any errors
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Submit
    setSubmitting(true);
    try {
      await postSubmission({
        title: form.title.trim(),
        speaker: form.speaker.trim(),
        email: form.email.trim(),
        category: form.category,
        abstract: form.abstract.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  

  if (submitted) {
    return (
      <div className="container mt-4">
        <div className="alert alert-success">
          Thanks, {form.speaker}! Your session proposal "{form.title}" has been submitted for review.
        </div>
        <button className="btn btn-secondary" onClick={handleReset}>
          Submit Another Proposal
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Submit a Session Proposal</h2>

      {submitError && (
        <div className="alert alert-danger">{submitError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label>Session Title:</label>
        <input type="text" name="title" value={form.title}
          onChange={handleChange} required />
          {errors.title && <div className="text-danger">{errors.title}</div>}
        <br /><br />

        <label>Speaker Name:</label>
        <input type="text" name="speaker" value={form.speaker}
          onChange={handleChange} required />
          {errors.speaker && <div className="text-danger">{errors.speaker}</div>}
        <br /><br />

        <label>Speaker Email:</label>
        <input type="email" name="email" value={form.email}
          onChange={handleChange} required />
          {errors.email && <div className="text-danger">{errors.email}</div>}
        <br /><br />

        <label>Category:</label>
        <select name="category" value={form.category}
          onChange={handleChange} required>
          <option value="" disabled>Choose a Category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <div className="text-danger">{errors.category}</div>}
        <br /><br />

        <label>Session Abstract:</label>
        <textarea name="abstract" value={form.abstract}
          onChange={handleChange} required />
          {errors.abstract && <div className="text-danger">{errors.abstract}</div>}
        <br /><br />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
}