
import { NavLink, Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
    const links = [
        ["/", "Home"],
        ["/signup", "Sign Up"],
        ["/sessions", "Sessions"],
        ["/cart", "Cart"],
        ["/register", "Register"],
        ["/submissions", "Submit"],
        ["/approvals", "Approvals"]
    ];

    return (
        <header className="site-navbar">
            <nav className="container navbar-content">

                {/* Website title */}
                <Link className="site-title" to="/">
                    ATTENDEE MANAGEMENT
                </Link>

                {/* Navigation links */}
                <div className="navbar-links">
                    {links.map(([path, label]) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === "/"}
                            className={({ isActive }) =>
                                `navbar-link ${isActive ? "active" : ""}`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </div>

            </nav>
        </header>
    );
}
