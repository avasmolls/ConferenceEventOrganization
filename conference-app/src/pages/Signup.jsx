import { useEffect, useState } from "react";

const EMPTY = { email: "", name: "", age: "", company: "" };


export default function Signup() {
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState("");
    const [attendees, setAttendees] = useState(() => {
        try { return JSON.parse(localStorage.getItem("attendees") || "[]"); }
        catch { return []; }
    });

    // replaces localStorage.setItem inside validateData()
    useEffect(() => {
        localStorage.setItem("attendees", JSON.stringify(attendees));
    }, [attendees]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    function validateData(e) {
        e.preventDefault();

        const rexAge = /\d{1,3}/;
        const rexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
        const rexName = /^[a-zA-Z]+\s[a-zA-Z]+$/;
        const rexCompany = /\w+/;

        if (!rexAge.test(form.age)) return alert("Not a number or null");
        if (!rexEmail.test(form.email)) return alert("Invalid email format");
        if (!rexName.test(form.name)) return alert("Invalid name format");
        if (!rexCompany.test(form.company)) return alert("Invalid company name");

        setAttendees([...attendees, { ...form }]);
        setForm(EMPTY);
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
                        <h2 className="text-center mb-4">Attendee Sign Up</h2>

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
                                Create Account
                            </button>
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
                        </tr>
                    </thead>
                    <tbody id="attendeeList">
                        {visible.map((a, i) => (
                            <tr key={i}>
                                <td>{a.name}</td>
                                <td>{a.email}</td>
                                <td>{a.age}</td>
                                <td>{a.company}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}