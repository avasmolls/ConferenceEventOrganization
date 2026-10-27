// i have added labels for all the jQuery changes since now we are using React
import { useEffect, useState } from "react";

const EMPTY = { id: "", title: "", category: "", format: "", price: "", speaker: "" };

function getErrors(f) {
  const errors = [];
  if (!/^[0-9]+$/.test(f.id.trim())) errors.push("Session ID must be a number.");
  if (!/^[a-zA-Z0-9\s]+$/.test(f.title.trim())) errors.push("Session Title must be alphanumeric.");
  if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(f.price.trim())) errors.push("Ticket Price must be a valid number.");
  if (!/^[a-zA-Z0-9\s]+$/.test(f.format.trim())) errors.push("Format must be alphanumeric.");
  if (f.speaker.trim() && !/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(f.speaker.trim()))
    errors.push("Speaker name must be a valid name.");
  if (!f.category) errors.push("Please choose a category.");
  return errors;
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState(false);

  // replaces $.getJSON("sessions.json")
  useEffect(() => {
    fetch("/sessions.json")
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => setLoadError(true));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  // replaces readForm()
  const toSession = () => ({
    id: Number(form.id.trim()),
    title: form.title.trim(),
    category: form.category,
    format: form.format.trim(),
    price: form.price.trim(),
    speaker: form.speaker.trim(),
  });

  // replaces validateForm() (the add function)
  const handleAdd = (e) => {
    e.preventDefault();
    const errors = getErrors(form);
    if (errors.length) return alert(errors.join("\n"));

    const entry = toSession();
    if (sessions.some((s) => s.id === entry.id))
      return alert("A session with that ID already exists. Use Edit, then Update Session.");

    setSessions([...sessions, entry]);
    resetForm();
  };

  // replaces the .edit-session-btn click handler
  const handleEdit = (s) => {
    setForm({
      id: String(s.id),
      title: s.title,
      category: s.category,
      format: s.format,
      price: String(s.price),
      speaker: s.speaker || "",
    });
    setEditingId(s.id);
  };

  // replaces the #updateBtn click handler
  const handleUpdate = () => {
    if (editingId === null) return alert("Click Edit on a session first.");
    const errors = getErrors(form);
    if (errors.length) return alert(errors.join("\n"));

    // { ...s, ...toSession() } keeps fields the form doesn't edit (description, unit)
    setSessions(
      sessions.map((s) => (s.id === editingId ? { ...s, ...toSession() } : s))
    );
    resetForm();
  };

  // replaces the #search input handler
  const term = search.toLowerCase().trim();
  const visible = sessions.filter((s) =>
    Object.values(s).some((v) => String(v).toLowerCase().includes(term))
  );

  return (
    <main className="container my-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold text-uppercase">Conference Sessions</h1>
        </div>
      </div>

      <div className="row g-4">
        {/* Add/Update Form */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
            <h2 className="h4 fw-bold mb-4">Add Session</h2>
            <form id="sessionForm" onSubmit={handleAdd}>
              <div className="mb-3">
                <label htmlFor="id" className="form-label fw-semibold">Session ID:</label>
                <input
                  type="text"
                  className="form-control"
                  id="id"
                  value={form.id}
                  onChange={handleChange}
                  readOnly={editingId !== null}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label fw-semibold">Session Title:</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label fw-semibold">Category:</label>
                <select
                  className="form-select"
                  id="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Choose a category</option>
                  <option value="Technology">Technology</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Keynote">Keynote</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="format" className="form-label fw-semibold">Format:</label>
                <input
                  type="text"
                  className="form-control"
                  id="format"
                  value={form.format}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label fw-semibold">Ticket Price:</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="text"
                    className="form-control"
                    id="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="speaker" className="form-label fw-semibold">Speaker:</label>
                <input
                  type="text"
                  className="form-control"
                  id="speaker"
                  value={form.speaker}
                  onChange={handleChange}
                />
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary fw-semibold py-2">
                  Add Session
                </button>
                <button
                  type="button"
                  id="updateBtn"
                  className="btn btn-outline-secondary fw-semibold py-2"
                  onClick={handleUpdate}
                >
                  Update Session
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Sessions */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
            <h2 className="h4 fw-bold mb-3 text-dark">Existing Sessions</h2>

            <div className="mb-3">
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="Search sessions"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div id="sessionTable" className="row">
              {loadError && (
                <div className="col-12 text-danger">Could not load sessions.json</div>
              )}
              {!loadError && visible.length === 0 && (
                <div className="col-12 text-center text-muted py-4">No session found</div>
              )}
              {visible.map((s) => (
                <SessionCard key={s.id} session={s} onEdit={handleEdit} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SessionCard({ session, onEdit }) {
  return (
    <div className="col-md-6 mb-4">
      <div className="card border-0 shadow-sm overflow-hidden h-100 ticket-card">
        <div className="row g-0 h-100">
          {/* Left Ticket Stub (Price & Category) */}
          <div className="col-4 bg-primary text-white d-flex flex-column justify-content-center align-items-center p-3 text-center ticket-stub">
            <span className="badge bg-light text-dark mb-2 text-truncate w-100">
              {session.category}
            </span>
            <h3 className="fw-bold mb-0 text-white">${session.price}</h3>
            <small className="text-white-50 text-uppercase">{session.format}</small>
          </div>

          {/* Right Ticket Details (Title, ID, Speaker) */}
          <div className="col-8 bg-white p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <h5 className="card-title fw-bold text-dark fs-6 text-truncate">
                  {session.title}
                </h5>
              </div>
              <p className="text-muted small mb-1">
                <strong>Speaker:</strong> {session.speaker || "TBD"}
              </p>
              <span className="badge bg-secondary bg-opacity-15 text-secondary border">
                ID: #{session.id}
              </span>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onEdit(session)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}