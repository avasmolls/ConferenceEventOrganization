import { useState, useEffect } from "react";

// Configuration
const USE_API = true; // set to true to use the API instead of local storage

const SUBMISSIONS_URL = "http://localhost:3001/submissions";
const LOCAL_STORAGE_KEY = "conferenceSubmissions";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"];

// Service layer

async function getSubmissions(signal) {
  if (USE_API) {
    const res = await fetch(SUBMISSIONS_URL, { signal });

    if (!res.ok) {
      throw new Error(`Failed to load submissions (${res.status})`);
    }

    return res.json();
  }

  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
}

async function patchSubmissionStatus(id, status) {
  if (USE_API) {
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

  const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");

  const updated = existing.map((s) =>
    s.id === id
      ? { ...s, status, decidedAt: new Date().toISOString() }
      : s
  );

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated.find((s) => s.id === id);
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
      setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (error) {
      setUpdateError(error.message);
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

      {loadError && (
        <div className="alert alert-danger">{loadError}</div>
      )}
      {updateError && (
        <div className="alert alert-danger">{updateError}</div>
      )}
      {loading && <p>Loading proposals...</p>}

      {!loading && !loadError && (
        <div className="btn-group mt-2" role="group" aria-label="Filter by status">
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
      )}

      {!loading && !loadError && submissions.length === 0 && (
        <p className="mt-3">No proposals have been submitted yet.</p>
      )}
      {!loading && !loadError && submissions.length > 0 && visibleSubmissions.length === 0 && (
        <p className="mt-3">No {statusFilter} proposals.</p>
      )}

      {visibleSubmissions.map((s) => (
        <div className="card p-3 mt-3" key={s.id}>
          <h4>{s.title}</h4>

          <p>Speaker: {s.speaker} ({s.email})</p>
          <p>Category: {s.category}</p>
          <p>{s.abstract}</p>

          <p>Status: {label(s.status)}</p>

          <div>
            <button type="button" className="btn btn-success me-2"
              disabled={updatingId === s.id || s.status === "approved"}
              onClick={() => handleReview(s.id, "approved")}>
              Approve
            </button>

            <button type="button" className="btn btn-danger"
              disabled={updatingId === s.id || s.status === "rejected"}
              onClick={() => handleReview(s.id, "rejected")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}