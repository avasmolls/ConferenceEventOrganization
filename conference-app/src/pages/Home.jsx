import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";

const imgStyle = { width: "100%", height: "100%", objectFit: "cover" };

const STEPS = [
  { title: "Sign up", text: "Create your attendee profile in under a minute." },
  { title: "Pick sessions", text: "Browse the schedule and choose what fits your interests." },
  { title: "Get confirmed", text: "Receive your confirmation details right away." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  // first three sessions from public/sessions.json
  useEffect(() => {
    fetch("/sessions.json")
      .then((r) => r.json())
      .then((data) => setFeatured(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <>
      <main className="container">
        {/* Hero (unchanged) */}
        <div className="placeholder-img placeholder-hero">
          <img src={image1} alt="Conference" style={imgStyle} />
        </div>

        <h1 className="hero-header">Conference Event Organizing</h1>
        <p className="hero-sub">
          Everything you need to organize a successful conference—from managing
          attendees to keeping event details organized and accessible.
        </p>

        <Link to="/signup" className="btn btn-cta btn-lg rounded-0 px-5">
          Sign Up Now
        </Link>

        {featured.length > 0 && (
          <section className="mb-5">
            <h2 className="section-heading">Featured Sessions</h2>
            <div className="row g-4">
              {featured.map((s) => (
                <div className="col-md-4" key={s.id}>
                  <div className="feature-card h-100 p-4">
                    <div className="strip-label">{s.category}</div>
                    <h3 className="h5 fw-bold">{s.title}</h3>
                    <p className="text-muted small mb-3">
                      {s.speaker || "TBD"} · {s.format}
                    </p>
                    <div className="fw-bold">${Number(s.price).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/sessions" className="d-inline-block mt-3 fw-bold link-dark">
              View all sessions →
            </Link>
          </section>
        )}


        <section className="mb-5">
          <h2 className="section-heading">How It Works</h2>
          <div className="row g-4">
            {STEPS.map((s, i) => (
              <div className="col-md-4" key={s.title}>
                <div className="step-number">{i + 1}</div>
                <h3 className="h5 fw-bold">{s.title}</h3>
                <p className="mb-0">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="placeholder-img placeholder-banner mb-5">
          <img src={image2} alt="Conference Banner" style={imgStyle} />
        </div>

        <section className="text-center mb-5">
          <h2 className="section-heading">Ready to Join?</h2>
          <Link to="/register" className="btn btn-cta btn-lg rounded-0 px-5">
            Register for Sessions
          </Link>
        </section>
      </main>
    </>
  );
}