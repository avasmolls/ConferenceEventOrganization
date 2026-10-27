// now that we are using React, we can easily use the navbar as a component rather than it having to be remade at every page

import { NavLink, Link } from "react-router-dom";

export default function NavBar() {
    // whenever we add a page, just add it here
    const links = [
        ["/", "Home"],
        ["/signup", "Sign Up"],
        ["/sessions", "Sessions"],
        ["/cart", "Cart"],
        ["/register", "Register"]
    ];
    return (
        <nav className="navbar navbar-expand py-3">
            <div className="container">
                <Link className="navbar-brand site-title" to="/">Attendee Management</Link>
                <ul className="navbar-nav ms-auto">
                    {links.map(([to, label]) => (
                        <li className="nav-item" key={to}>
                            <NavLink className="nav-link" to={to} end={to === "/"}>{label}</NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}