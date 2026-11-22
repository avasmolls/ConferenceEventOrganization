
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";

const SESSIONS_URL = "http://localhost:3001/sessions";

const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const STEPS = [
  {
    title: "Sign up",
    text: "Create your attendee profile in under a minute.",
  },
  {
    title: "Pick sessions",
    text: "Browse the schedule and choose what fits your interests.",
  },
  {
    title: "Get confirmed",
    text: "Receive your confirmation details right away.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load featured sessions from MongoDB through the backend API
  useEffect(() => {
    const controller = new AbortController();

    async function loadFeaturedSessions() {
      try {
        const response = await fetch(SESSIONS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load sessions (${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid sessions response.");
        }

        // Display the first three sessions
        setFeatured(data.slice(0, 3));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load featured sessions.");
          console.error("Sessions API error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFeaturedSessions();

    return () => controller.abort();
  }, []);

  return (
    <>
      <main className="container">

        {/* Hero Section */}
        <div className="placeholder-img placeholder-hero">
          <img
            src={image1}
            alt="Conference"
            style={imgStyle}
          />
        </div>

        <h1 className="hero-header">
          Conference Event Organizing
        </h1>

        <p className="hero-sub">
          Everything you need to organize a successful
          conference, from managing attendees to keeping
          event details organized and accessible.
        </p>

        <Link
          to="/signup"
          className="btn btn-cta btn-lg rounded-0 px-5"
        >
          Sign Up Now
        </Link>

        {/* Featured Sessions from MongoDB */}
        <section className="mb-5">
          <h2 className="section-heading">
            Featured Sessions
          </h2>

          {loading && (
            <p role="status">Loading featured sessions...</p>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && featured.length === 0 && (
            <p>No featured sessions are available.</p>
          )}

          {!loading && !error && featured.length > 0 && (
            <>
              <div className="row g-4">
                {featured.map((session) => (
                  <div
                    className="col-12 col-md-4"
                    key={session.id}
                  >
                    <div className="feature-card h-100 p-4">

                      <div className="strip-label">
                        {session.category}
                      </div>

                      <h3 className="h5 fw-bold">
                        {session.title}
                      </h3>

                      <p className="text-muted small mb-3">
                        {session.speaker || "TBD"} ·{" "}
                        {session.format}
                      </p>

                      <div className="fw-bold">
                        $
                        {Number(
                          session.price || 0
                        ).toFixed(2)}
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/sessions"
                className="d-inline-block mt-3 fw-bold link-dark"
              >
                View all sessions →
              </Link>
            </>
          )}
        </section>

        {/* How It Works */}
        <section className="mb-5">
          <h2 className="section-heading">
            How It Works
          </h2>

          <div className="row g-4">
            {STEPS.map((step, index) => (
              <div
                className="col-12 col-md-4"
                key={step.title}
              >
                <div className="step-number">
                  {index + 1}
                </div>

                <h3 className="h5 fw-bold">
                  {step.title}
                </h3>

                <p className="mb-0">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Conference Banner */}
        <div className="placeholder-img placeholder-banner mb-5">
          <img
            src={image2}
            alt="Conference Banner"
            style={imgStyle}
          />
        </div>

        {/* Registration Section */}
        <section className="text-center mb-5">
          <h2 className="section-heading">
            Ready to Join?
          </h2>

          <Link
            to="/register"
            className="btn btn-cta btn-lg rounded-0 px-5"
          >
            Register for Sessions
          </Link>
        </section>

      </main>
    </>
  );
}
