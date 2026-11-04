
export default function Submissions() {
  return (
    <div className="container mt-4">
      <h2>Submit a Session Proposal</h2>

      <form>
        <label>Session Title:</label>
        <input type="text" name="title" required />
        <br /><br />

        <label>Speaker Name:</label>
        <input type="text" name="speaker" required />
        <br /><br />

        <label>Speaker Email:</label>
        <input type="email" name="email" required />
        <br /><br />

        <label>Category:</label>
        <select name="category" required defaultValue="">
          <option value="">Choose a Category</option>
          <option value="Technology">Technology</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Business">Business</option>
        </select>
        <br /><br />

        <label>Session Abstract:</label>
        <textarea name="abstract" required />
        <br /><br />

        <button type="submit">Submit Proposal</button>
      </form>
    </div>
  );
}
