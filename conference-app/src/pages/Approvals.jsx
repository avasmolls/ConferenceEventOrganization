import { useState, useEffect } from "react";

// Configuration
const SUBMISSIONS_URL =
  import.meta.env.VITE_SUBMISSIONS_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3001/submissions"
    : "/submissions");

const submissionId = (submission) => submission.id ?? submission._id;
const STATUS_FILTERS = ["all", "pending", "approved", "rejected"];
// Service layer
// GET- Load submissions
async function getSubmissions(signal) {
  const res = await fetch(SUBMISSIONS_URL, { signal });

  if (!res.ok) {
    throw new Error(`Failed to load submissions (${res.status})`);
  }

  return res.json();
}

// PATCH- Approve or reject
async function patchSubmissionStatus(id, status) {
  const res = await fetch(`${SUBMISSIONS_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update submission (${res.status})`);
  }

  return res.json();
}

// PUT- Edit submission
async function putSubmission(id, payload) {
  const res = await fetch(`${SUBMISSIONS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to edit submission (${res.status})`);
  }

  return res.json();
}

// DELETE- Remove submission
async function deleteSubmission(id) {
  const res = await fetch(`${SUBMISSIONS_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete submission (${res.status})`);
  }
}

// Component
export default function Approvals() {
  // (GET) state
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // (PATCH) state
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  // GET submissions
  useEffect(() => {
    const controller = new AbortController();

    async function loadSubmissions() {
      try {
        const data = await getSubmissions(controller.signal);
        setSubmissions(data);
      }
      catch (err) {
        if (err.name !== "AbortError") setLoadError(err.message);
      }
      finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSubmissions();
    return () => controller.abort();
  }, []);

  // approve/reject submission


  const handleReview = async (id, status) => {
    setUpdateError(null);
    try {
      setUpdatingId(id);
      const updated = await patchSubmissionStatus(id, status);
      setSubmissions((prev) =>
  prev.map((s) =>
    submissionId(s) === id ? updated : s
  )
);
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

    // Start editing a submission
  const handleStartEdit = (submission) => {
    setEditingId(submissionId(submission));

    setEditForm({
      title: submission.title,
      speaker: submission.speaker,
      email: submission.email,
      category: submission.category,
      abstract: submission.abstract,
    });

    setUpdateError(null);
  };

  // Save edited submission
  const handleSaveEdit = async (id) => {
    if (!editForm) return;

    const payload = {
      title: editForm.title.trim(),
      speaker: editForm.speaker.trim(),
      email: editForm.email.trim(),
      category: editForm.category,
      abstract: editForm.abstract.trim(),
    };

    // Validation
    if (
      !payload.title ||
      !payload.speaker ||
      !payload.email ||
      !payload.category ||
      payload.abstract.length < 20
    ) {
      setUpdateError(
        "Fill out all fields. The abstract must have at least 20 characters."
      );
      return;
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!EMAIL_REGEX.test(payload.email)) {
      setUpdateError("Enter a valid speaker email.");
      return;
    }

    setUpdateError(null);
    setUpdatingId(id);

    try {
      const updated = await putSubmission(id, payload);

      setSubmissions((prev) =>
        prev.map((s) =>
          submissionId(s) === id ? updated : s
        )
      );

      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };
  // Delete submission
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this proposal permanently?")) {
      return;
    }

    setUpdateError(null);
    setUpdatingId(id);

    try {
      await deleteSubmission(id);

      setSubmissions((prev) =>
        prev.filter((s) => submissionId(s) !== id)
      );

      if (editingId === id) {
        setEditingId(null);
        setEditForm(null);
      }
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const label = (status) => status.charAt(0).toUpperCase() + status.slice(1);
  // Filtering and counts
  const countFor = (status) =>
    status === "all"
      ? submissions.length
      : submissions.filter((s) => s.status === status).length;

  const visibleSubmissions =
    statusFilter === "all"
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);
  return (
    <div className="container mt-4">
      <h2>Session Proposal Approvals</h2>
      {/* Filter Buttons */}
      <div className="btn-group mb-4" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`btn ${statusFilter === f ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setStatusFilter(f)}
          >
            {label(f)} ({countFor(f)})
          </button>
        ))}
      </div>
      {loadError && (
        <div className="alert alert-danger">{loadError}</div>
      )}
      {updateError && (
        <div className="alert alert-danger">{updateError}</div>
      )}
      {loading && <p>Loading proposals...</p>}
      {!loading && !loadError && submissions.length === 0 && (
        <p>No proposals have been submitted yet.</p>
      )}

      {visibleSubmissions.map((s) => (
        <div className="card p-3 mt-3" key={submissionId(s)}>
          <h4>{s.title}</h4>

          <p>Speaker: {s.speaker} ({s.email})</p>
          <p>Category: {s.category}</p>
          <p>{s.abstract}</p>
          {/* Edit submission form */}
          {editingId === submissionId(s) && editForm && (
            <form
              className="mb-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(submissionId(s));
              }}
            >
              {/* Title, speaker, email */}
              {[
                ["title", "Session Title"],
                ["speaker", "Speaker Name"],
                ["email", "Speaker Email"],
              ].map(([field, fieldLabel]) => (
                <div className="mb-2" key={field}>
                  <label className="form-label">
                    {fieldLabel}
                  </label>

                  <input
                    className="form-control"
                    type={field === "email" ? "email" : "text"}
                    value={editForm[field]}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        [field]: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              ))}

              {/* Category */}
              <div className="mb-2">
                <label className="form-label">Category</label>

                <select
                  className="form-select"
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value,
                    })
                  }
                >
                  {[
                    "Keynote",
                    "Workshop",
                    "Panel",
                    "Lightning Talk",
                    "Technology",
                    "Other",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Abstract */}
              <div className="mb-2">
                <label className="form-label">Abstract</label>

                <textarea
                  className="form-control"
                  rows="3"
                  value={editForm.abstract}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      abstract: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Save and Cancel */}
              <button
                type="submit"
                className="btn btn-primary btn-sm me-2"
                disabled={updatingId === submissionId(s)}
              >
                Save Changes
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setEditingId(null);
                  setEditForm(null);
                }}
              >
                Cancel
              </button>
            </form>
          )}
          <p>Status: {label(s.status)}</p>

                    {/* Proposal actions */}
          <div className="d-flex gap-2 flex-wrap">

            {/* Approve */}
            <button
              type="button"
              className="btn btn-success me-2"
              disabled={
                updatingId === submissionId(s) ||
                s.status === "approved"
              }
              onClick={() =>
                handleReview(submissionId(s), "approved")
              }
            >
              Approve
            </button>

            {/* Reject */}
            <button
              type="button"
              className="btn btn-danger"
              disabled={
                updatingId === submissionId(s) ||
                s.status === "rejected"
              }
              onClick={() =>
                handleReview(submissionId(s), "rejected")
              }
            >
              Reject
            </button>

            {/* Edit */}
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={
                updatingId === submissionId(s) ||
                editingId === submissionId(s)
              }
              onClick={() => handleStartEdit(s)}
            >
              Edit
            </button>

            {/* Delete */}
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled={updatingId === submissionId(s)}
              onClick={() => handleDelete(submissionId(s))}
            >
              {updatingId === submissionId(s)
                ? "Working..."
                : "Delete"}
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}