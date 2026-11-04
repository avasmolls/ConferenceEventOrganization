
export default function Approvals() {
  return (
    <div className="container mt-4">
      <h2>Session Proposal Approvals</h2>

      <div className="card p-3 mt-3">
        <h4>Future of Cybersecurity</h4>

        <p>Speaker: John Smith</p>
        <p>Category: Cybersecurity</p>
        <p>
          A discussion about emerging
          cybersecurity threats.
        </p>

        <p>Status: Pending</p>

        <div>
          <button type="button" className="btn btn-success me-2">
            Approve
          </button>

          <button type="button" className="btn btn-danger">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
