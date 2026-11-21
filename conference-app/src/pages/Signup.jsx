import { useEffect, useState } from "react";

const ATTENDEES_URL = "http://localhost:3001/attendees";
const EMPTY = { email: "", name: "", age: "", company: "" };


export default function Signup() {
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState("");
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");


    // GET Request
    // replaces localStorage.setItem inside validateData()
    useEffect(() => {
        fetch(ATTENDEES_URL)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch attendees");
                return res.json();
            })
            .then((data) => {
setAttendees(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


    // EDIT: Fill the form with the selected attendee
    function handleEdit(attendee) {
        setEditingId(attendee.id);
        setForm({
            email: attendee.email,
            name: attendee.name,
            age: String(attendee.age),
            company: attendee.company
        });
        setError(null);
        setMessage("");
        window.scrollTo(0, 0);
    }

    // Cancel editing and clear the form
    function cancelEdit() {
        setEditingId(null);
        setForm(EMPTY);
    }

    // DELETE Request
    async function handleDelete(id) {
        if (!window.confirm("Delete this attendee?")) return;

        setError(null);
        setMessage("");

        try {
            const res = await fetch(ATTENDEES_URL + "/" + id, {
                method: "DELETE"
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete attendee");
            }

            setAttendees((current) =>
                current.filter((a) => a.id !== id)
            );

            if (editingId === id) cancelEdit();
            setMessage("Attendee deleted successfully.");
        } catch (err) {
            setError(err.message);
        }
    }


    async function validateData(e) {
        e.preventDefault();
        setError(null);
        setMessage("");

        const rexAge = /^\d{1,3}$/;
        const rexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
        const rexName = /^[a-zA-Z]+\s[a-zA-Z]+$/;
        const rexCompany = /\w+/;


        if (!rexAge.test(form.age) || Number(form.age) < 1 || Number(form.age) > 100)
            return alert("Age must be between 1 and 100");
        if (!rexEmail.test(form.email)) return alert("Invalid email format");
        if (!rexName.test(form.name)) return alert("Invalid name format");
        if (!rexCompany.test(form.company)) return alert("Invalid company name");

        const editing = editingId !== null;
        // POST creates an attendee, PUT updates an attendee
        try {
            const url = editing ? ATTENDEES_URL + "/" + editingId : ATTENDEES_URL;

            const res = await fetch(url, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, age: Number(form.age) }),
            });


        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to save attendee");
        }

       
        const savedAttendee = await res.json();

        if (editing) {
            setAttendees(attendees.map((a) =>
                a.id === editingId ? savedAttendee : a
            ));
        } else {
            setAttendees([...attendees, savedAttendee]);
        }

        cancelEdit();
        setMessage(editing ? "Attendee updated successfully." : "Account created successfully.");

    }
    catch (err) {
        setError(err.message);
    }
}

    const term = search.toLowerCase();
    const visible = attendees.filter((a) =>
        (a.name + a.email + a.company).toLowerCase().includes(term)
    );

    // our existing old signup.html now transferred into jsx for React
    return (
        <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="card shadow-sm p-4">
                        <h2 className="text-center mb-4">
                            {editingId !== null ? "Edit Attendee" : "Attendee Sign Up"}
                        </h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {message && <div className="alert alert-success">{message}</div>}
                        <form id="signupForm" onSubmit={validateData}>
                            <div className="mb-3">
                                <label htmlFor="tbEmail" className="form-label">Email:</label>
                                <input type="text" className="form-control" id="tbEmail" name="email"
                                    value={form.email} onChange={handleChange} />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="tbName" className="form-label">First and Last Name:</label>
                                <input type="text" className="form-control" id="tbName" name="name"
                                    value={form.name} onChange={handleChange} />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="tbAge" className="form-label">Age:</label>
                                <input type="text" className="form-control" id="tbAge" name="age"
                                    value={form.age} onChange={handleChange} />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="tbCompany" className="form-label">Company Name:</label>
                                <input type="text" className="form-control" id="tbCompany" name="company"
                                    value={form.company} onChange={handleChange} />
                            </div>

                            <button id="btnSubmit" type="submit" className="btn btn-primary w-100">
                                     {editingId !== null ? "Save Changes" : "Create Account"}
                            </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                className="btn btn-secondary w-100 mt-2"
                                onClick={cancelEdit}
                            >
                                Cancel Editing
                            </button>
                        )}

                        </form>
                    </div>
                </div>
            </div>

            <div className="container mt-5">
                <h2>Registered Attendees</h2>

                <input
                    type="search"
                    id="attendeeSearch"
                    className="form-control mb-3"
                    placeholder="Search by name, email, or company"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Company</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="attendeeList">
                        {visible.map((a) => (
                            
                <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.age}</td>
                    <td>{a.company}</td>
                    <td>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => handleEdit(a)}
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(a.id)}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}