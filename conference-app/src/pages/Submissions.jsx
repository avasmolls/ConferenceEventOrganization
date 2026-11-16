import { useEffect, useState } from "react";

// Configuration
const SUBMISSIONS_URL =
  import.meta.env.VITE_SUBMISSIONS_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3001/submissions"
    : "/submissions");

const submissionId = (submission) => submission.id ?? submission._id;

const CATEGORIES = ["Keynote", "Workshop", "Panel", "Lightning Talk", "Technology", "Other"];

const initialForm = {
  title: "",
  speaker: "",
  email: "",
  category: "",
  abstract: "",
};

// Service layer

// POST- Create a submission
async function postSubmission(payload) {
  const res = await fetch(SUBMISSIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to submit proposal (${res.status})`);
  }

  return res.json();
}

// GET- Retrieve existing submissions
async function getSubmissions(signal) {
  const res = await fetch(SUBMISSIONS_URL, { signal });

  if (!res.ok) {
    throw new Error(`Failed to load proposals (${res.status})`);
  }

  return res.json();
}

// PUT- Edit an existing submission
async function putSubmission(id, payload) {
  const res = await fetch(`${SUBMISSIONS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to edit proposal (${res.status})`);
  }

  return res.json();
}

// DELETE- Remove a submission
async function deleteSubmission(id) {
  const res = await fetch(`${SUBMISSIONS_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete proposal (${res.status})`);
  }
}

// Component
export default function Submissions() {
  // Form state
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  // Existing proposals
  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [listError, setListError] = useState(null);
  const [saveWasEdit, setSaveWasEdit] = useState(false);

  // Load submissions from backend
  useEffect(() => {
    const controller = new AbortController();

    getSubmissions(controller.signal)
      .then((data) => {
        setSubmissions(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setListError(err.message);
        }
      });

    return () => controller.abort();
  }, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm(initialForm);
    setSubmitted(false);
    setSubmitError(null);
    setErrors({});
    setEditingId(null);
  };

  // Edit an existing proposal
  const handleEdit = (submission) => {
    setEditingId(submissionId(submission));

    setForm({
      title: submission.title,
      speaker: submission.speaker,
      email: submission.email,
      category: submission.category,
      abstract: submission.abstract,
    });

    setSubmitted(false);
    setErrors({});
    setSubmitError(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete an existing proposal
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal permanently?")) {
      return;
    }

    setListError(null);
    setDeletingId(id);

    try {
      await deleteSubmission(id);

      setSubmissions((prev) =>
        prev.filter((s) => submissionId(s) !== id)
      );

      if (editingId === id) {
        handleReset();
      }
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    const newErrors = {};
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const TITLE_REGEX = /^[a-zA-Z0-9\s]+$/;

    if (!form.title.trim()) {
      newErrors.title = "Session title is required.";
    } else if (!TITLE_REGEX.test(form.title.trim())) {
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

    // Submit or update proposal
  setSubmitting(true);

  try {
    const payload = {
      title: form.title.trim(),
      speaker: form.speaker.trim(),
      email: form.email.trim(),
      category: form.category,
      abstract: form.abstract.trim(),
    };

    const wasEditing = editingId !== null;

    const saved = wasEditing
      ? await putSubmission(editingId, payload)
      : await postSubmission(payload);

    setSubmissions((prev) =>
      wasEditing
        ? prev.map((s) =>
            submissionId(s) === editingId ? saved : s
          )
        : [...prev, saved]
    );

    setSaveWasEdit(wasEditing);
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
        {saveWasEdit
          ? `Your proposal "${form.title}" has been updated.`
          : `Thanks, ${form.speaker}! Your session proposal "${form.title}" has been submitted for review.`}
      </div>

      <button className="btn btn-secondary" onClick={handleReset}>
        Return to Proposals
      </button>
    </div>
  );
}

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {editingId !== null
          ? "Edit a Session Proposal"
          : "Submit a Session Proposal"}
      </h2>

      {submitError && (
        <div className="alert alert-danger">{submitError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Session Title */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label fw-semibold">Session Title:</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="form-control" 
            value={form.title} 
            onChange={handleChange} 
            required 
          />
          {errors.title && <div className="text-danger small mt-1">{errors.title}</div>}
        </div>
        
        {/* Speaker Name */}
        <div className="mb-3">
          <label htmlFor="speaker" className="form-label fw-semibold">Speaker Name:</label>
          <input 
            type="text" 
            id="speaker" 
            name="speaker" 
            className="form-control" 
            value={form.speaker} 
            onChange={handleChange} 
            required 
          />
          {errors.speaker && <div className="text-danger small mt-1">{errors.speaker}</div>}
        </div>

        {/* Speaker Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">Speaker Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
        </div>

        {/* Category Selection */}
        <div className="mb-3">
          <label htmlFor="category" className="form-label fw-semibold">Category:</label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
            required
            >
              <option value=""  disabled>Choose a Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          {errors.category && <div className="text-danger small mt-1">{errors.category}</div>}
        </div>

        {/* Session Abstract */}
        <div className="mb-3">
          <label htmlFor="abstract" className="form-label fw-semibold">Session Abstract:</label>
          <textarea
            id="abstract"
            name="abstract"
            className="form-control"
            rows="4"
            value={form.abstract}
            onChange={handleChange}
            required
          />
          {errors.abstract && <div className="text-danger small mt-1">{errors.abstract}</div>}
        </div>

        {/* Submit or Save */}
        <button
          type="submit"
          className="btn btn-primary w-100 py-2"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : editingId !== null
            ? "Save Changes"
            : "Submit Proposal"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="btn btn-outline-secondary mt-2"
            onClick={handleReset}
          >
            Cancel Editing
          </button>
        )}
        </form>
        {/* Existing proposals */}
<h3 className="mt-5">Existing Proposals</h3>

{listError && (
  <div className="alert alert-danger">{listError}</div>
)}

{submissions.length === 0 && !listError && (
  <p>No proposals yet.</p>
)}

{submissions.map((s) => (
  <div
    className="card p-3 mb-3"
    key={submissionId(s)}
  >
    <h4 className="h5">{s.title}</h4>

    <p className="mb-1">
      {s.speaker} · {s.category} · {s.status}
    </p>

    <p>{s.abstract}</p>

    <div className="d-flex gap-2">
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={() => handleEdit(s)}
        disabled={
          submitting || deletingId === submissionId(s)
        }
      >
        Edit
      </button>

      <button
        type="button"
        className="btn btn-outline-danger btn-sm"
        onClick={() => handleDelete(submissionId(s))}
        disabled={
          deletingId === submissionId(s) || submitting
        }
      >
        {deletingId === submissionId(s)
          ? "Deleting..."
          : "Delete"}
      </button>
    </div>
  </div>
))}
      </div>
    );
}