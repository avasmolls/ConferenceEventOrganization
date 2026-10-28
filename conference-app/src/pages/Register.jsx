
export default function Register() {
    return (
        <div className="container mt-4">
            <h2>Conference Registration</h2>

            <form>
                <label>Full Name:</label>
                <input type="text" name="fullName" required />
                <br /><br />

                <label>Email:</label>
                <input type="email" name="email" required />
                <br /><br />

                <label>Session:</label>
                <select name="session" required defaultValue="">
                    <option value="">Choose a Session</option>
                    <option value="1">Sample Workshop</option>
                    <option value="2">Future of Cybersecurity</option>
                    <option value="3">Building Better Websites</option>
                    <option value="4">Innovation in Technology</option>
                    <option value="5">Artificial Intelligence Trends</option>
                    <option value="6">Career Development Strategies</option>
                </select>
                <br /><br />

                <label>Participation Type:</label>
                <select name="participation" required defaultValue="">
                    <option value="">Choose a Type</option>
                    <option value="in-person">In Person</option>
                    <option value="virtual">Virtual</option>
                    <option value="vip">VIP</option>
                </select>
                <br /><br />

                <label>Additional Notes:</label>
                <textarea name="notes"></textarea>
                <br /><br />

                <button type="submit" className="btn btn-primary">
                    Confirm Registration
                </button>
            </form>
        </div>
    );
}
