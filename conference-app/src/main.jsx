import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// Shared styles
import "./styles/global.css";
import "./styles/Navbar.css";

// Page styles
import "./styles/Home.css";
import "./styles/Signup.css";
import "./styles/Sessions.css";
import "./styles/Cart.css";
import "./styles/Register.css";
import "./styles/Submissions.css";
import "./styles/Approvals.css";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);