import { useEffect, useState } from "react";

// Configuration (same pattern as Submissions / Approvals)
const SESSIONS_URL =
  import.meta.env.VITE_SESSIONS_URL ||
  (import.meta.env.DEV ? "http://localhost:3001/sessions" : "/sessions");

const sessionId = (session) => session.id ?? session._id;

const CATEGORIES = ["Keynote", "Workshop", "Panel", "Lightning Talk", "Technology", "Other"];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  format: "",
  unit: "Ticket",
  price: "",
  speaker: "",
};

// Service layer
async function getSessions(signal) {
  const res = await fetch(SESSIONS_URL, { signal });
  if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`);
  return res.json();
}

async function postSession(payload) {
  const res = await fetch(SESSIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to add session (${res.status})`);
  return res.json();
}

async function putSession(id, payload) {
  const res = await fetch(`${SESSIONS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update session (${res.status})`);
  return res.json();
}

async function deleteSession(id) {
  const res = await fetch(`${SESSIONS_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete session (${res.status})`);
}

// Component
export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Load sessions
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setSessions(await getSessions(controller.signal));
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleStartAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const handleStartEdit = (s) => {
    setEditingId(sessionId(s));
    setForm({
      title: s.title ?? "",
      description: s.description ?? "",
      category: s.category ?? "",
      format: s.format ?? "",
      unit: s.unit ?? "Ticket",
      price: String(s.price ?? ""),
      speaker: s.speaker ?? "",
    });
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    const price = Number(form.price);

    if (!form.title.trim() || !form.category || !form.format.trim()) {
      setError("Title, category, and format are required.");
      return;
    }
    if (form.price === "" || Number.isNaN(price) || price < 0) {
      setError("Enter a price of 0 or more.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      format: form.format.trim(),
      unit: form.unit.trim() || "Ticket",
      price,
      speaker: form.speaker.trim(),
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        const updated = await putSession(editingId, payload);
        setSessions((prev) =>
          prev.map((s) => (sessionId(s) === editingId ? updated : s))
        );
      } else {
        const created = await postSession(payload);
        setSessions((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session permanently?")) return;

    setError(null);
    setBusyId(id);
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => sessionId(s) !== id));
      if (editingId === id) closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // Filtering
  const term = search.trim().toLowerCase();
  const visible = sessions.filter((s) => {
    const matchesCategory =
      categoryFilter === "all" || s.category === categoryFilter;
    const matchesSearch =
      !term ||
      `${s.title} ${s.speaker ?? ""} ${s.description ?? ""}`
        .toLowerCase()
        .includes(term);
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) =>
    price === 0 ? "Free" : `$${Number(price).toFixed(2)}`;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Sessions</h2>
        {!showForm && (
          <button type="button" className="btn btn-primary" onClick={handleStartAdd}>
            Add Session
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Add / edit form */}
      {showForm && (
        <form className="card p-3 mb-4" onSubmit={handleSave} noValidate>
          <h4 className="h5 mb-3">
            {editingId !== null ? "Edit Session" : "Add a Session"}
          </h4>

          <div className="row g-3">
            <div className="col-md-8">
              <label htmlFor="title" className="form-label">Title</label>
              <input id="title" name="title" className="form-control"
                value={form.title} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label htmlFor="speaker" className="form-label">Speaker</label>
              <input id="speaker" name="speaker" className="form-control"
                value={form.speaker} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label htmlFor="category" className="form-label">Category</label>
              <select id="category" name="category" className="form-select"
                value={form.category} onChange={handleChange}>
                <option value="" disabled>Choose a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="format" className="form-label">Format</label>
              <input id="format" name="format" className="form-control"
                placeholder="In person, Online, Hybrid"
                value={form.format} onChange={handleChange} />
            </div>

            <div className="col-md-2">
              <label htmlFor="unit" className="form-label">Unit</label>
              <input id="unit" name="unit" className="form-control"
                value={form.unit} onChange={handleChange} />
            </div>

            <div className="col-md-2">
              <label htmlFor="price" className="form-label">Price ($)</label>
              <input id="price" name="price" type="number" min="0" step="0.01"
                className="form-control" value={form.price} onChange={handleChange} />
            </div>

            <div className="col-12">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" name="description" rows="3"
                className="form-control" value={form.description}
                onChange={handleChange} />
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-primary me-2" disabled={saving}>
              {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Add Session"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search and category filter */}
      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <input
            type="search"
            className="form-control"
            placeholder="Search by title, speaker, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Loading sessions...</p>}

      {!loading && sessions.length === 0 && !error && (
        <p>No sessions yet. Use Add Session to create the first one.</p>
      )}

      {!loading && sessions.length > 0 && visible.length === 0 && (
        <p>No sessions match your search.</p>
      )}

      {/* Session list */}
      <div className="row">
        {visible.map((s) => (
          <div className="col-md-6 mb-3" key={sessionId(s)}>
            <div className="card h-100 p-3">
              <div className="d-flex justify-content-between align-items-start">
                <h4 className="h5">{s.title}</h4>
                <span className="badge text-bg-secondary">{s.category}</span>
              </div>

              {s.speaker && <p className="mb-1 text-muted">{s.speaker}</p>}
              {s.description && <p>{s.description}</p>}

              <p className="mb-3">
                {s.format} · <strong>{formatPrice(s.price)}</strong>
                {s.price > 0 && s.unit ? ` per ${s.unit.toLowerCase()}` : ""}
              </p>

              <div className="d-flex gap-2 mt-auto">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={busyId === sessionId(s)}
                  onClick={() => handleStartEdit(s)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  disabled={busyId === sessionId(s)}
                  onClick={() => handleDelete(sessionId(s))}
                >
                  {busyId === sessionId(s) ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}