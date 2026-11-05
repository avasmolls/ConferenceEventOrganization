import { useState } from "react";

// Configuration
const USE_API = false; // set to true to use the API instead of local storage

const SUBMISSIONS_URL = "http://localhost:3001/submissions";
const LOCAL_STORAGE_KEY = "conferenceSubmissions";

// use your own category list here if you already have one
const CATEGORIES = ["Keynote", "Workshop", "Panel", "Lightning Talk", "Technology","Other"];

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
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.errors?.join(" ") || `Submission failed (${res.status})`);
    }
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
  // Form state and validation
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
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

      {sessionsError && (
        <div className="alert alert-danger">{sessionsError}</div>
      )}
      {submitError && (
        <div className="alert alert-danger">{submitError}</div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Session Title:</label>
        <input type="text" name="title" value={form.title}
          onChange={handleChange} required />
        <br /><br />

        <label>Speaker Name:</label>
        <input type="text" name="speaker" value={form.speaker}
          onChange={handleChange} required />
        <br /><br />

        <label>Speaker Email:</label>
        <input type="email" name="email" value={form.email}
          onChange={handleChange} required />
        <br /><br />

        <label>Category:</label>
        <select name="category" value={form.category}
          onChange={handleChange} required>
          <option value="" disabled>Choose a Category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <br /><br />

        <label>Session Abstract:</label>
        <textarea name="abstract" value={form.abstract}
          onChange={handleChange} required />
        <br /><br />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
}