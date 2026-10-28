<div align="center">

# Conference Event Organization

**A responsive conference management app for creating sessions, registering attendees, and building a ticket cart.**

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

[Source Code](https://github.com/avasmolls/ConferenceEventOrganization) · [Features](#features) · [Getting Started](#getting-started) · [Team](#team)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Pages and Routes](#pages-and-routes)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Team](#team)
- [Limitations and Roadmap](#limitations-and-roadmap)

## Overview

Conference Event Organization is a team project built for **IST 256 at The Pennsylvania State University**. It gives organizers and attendees one place to manage conference sessions, register for the event, and select tickets.

The project began as a multi-page site using HTML, CSS, Bootstrap, JavaScript, jQuery, JSON, and AJAX, and was later migrated to a component-based **React** application for better organization, maintainability, and state management.

**What it demonstrates:** dynamic data rendering, client-side state management, form validation, responsive design, and collaborative development with Git and GitHub.

## Features

### Session Management
- Create and edit sessions (title, category, format, ticket price, speaker)
- Edit through forms that populate automatically from the selected session
- Search and filter sessions in real time
- Load initial data from a JSON file using the Fetch API
- Browse sessions as responsive, ticket-style cards
- Validate input and block duplicate session IDs

### Attendee Registration
- Register through a validated sign-up form (name, email, age, company)
- Persist attendee records in the browser with `localStorage`
- View attendees in a table and filter by name, email, or company

### Shopping Cart
- Browse and search available sessions
- Add or remove sessions, with duplicate entries prevented
- See ticket totals update automatically

### Interface
- Mobile-friendly layouts built on Bootstrap 5
- Shared navigation across all pages
- Featured session previews and calls to action on the homepage

## Tech Stack

| Category | Technologies |
|---|---|
| **UI** | React 19, React Router, HTML5, CSS3, Bootstrap 5 |
| **Language** | JavaScript (ES6+) |
| **Tooling** | Vite 8, Oxlint |
| **Data** | JSON (`sessions.json`), Fetch API, `localStorage` |
| **Collaboration** | Git, GitHub |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (a version compatible with Vite 8)
- npm
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/avasmolls/ConferenceEventOrganization.git

# 2. Move into the app directory
cd ConferenceEventOrganization/conference-app

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open the local URL printed in your terminal (typically `http://localhost:5173`).

> **Note:** Run all npm commands from the `conference-app` directory, and use the Vite server rather than opening HTML files directly.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint static analysis |

## Pages and Routes

| Page | Purpose | Highlights |
|---|---|---|
| **Home** | Landing page and entry point | Conference intro, featured sessions loaded dynamically, registration calls to action |
| **Sign Up** | Attendee registration | Validated form, `localStorage` persistence, searchable attendee table |
| **Sessions** | Session administration | Create and edit sessions, validation, JSON data, real-time search |
| **Shopping Cart** | Ticket selection | Add and remove sessions, automatic totals, search |

## Project Structure

```text
ConferenceEventOrganization/
├── README.md
└── conference-app/
    ├── public/
    │   └── sessions.json        # Initial session data
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   └── Navbar.jsx       # Shared navigation
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Sessions.jsx
    │   │   ├── Cart.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx              # Routes and layout
    │   ├── main.jsx             # Entry point
    │   └── styles.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## How It Works

**State management.** React Hooks (`useState`, `useEffect`) drive form handling, session creation and editing, search and filtering, cart contents and totals, and attendee data.

**Data flow.** Sessions load once from `sessions.json` via the Fetch API and are then managed in React state. Attendee records are stored in `localStorage`. Session edits live in memory only and reset on refresh.

**Validation.** Regular expressions and validation helpers check required fields, numeric IDs, ticket prices, email formats, attendee details, and duplicate session IDs before a form is accepted.

**Architecture.** Shared UI such as the navbar is separated from page-level components, and React Router handles navigation between pages without full reloads.

## Team

Built by six Penn State students for IST 256.

| Member | Primary Responsibilities |
|---|---|
| **Ava Smolley** | React migration, application architecture, jQuery functionality, homepage (HTML, CSS, Bootstrap) |
| **Griffin Crothers** | JavaScript functionality, session form validation, sign-up functionality |
| **Anatoly DelGuerico** | JSON integration, AJAX, sign-up JavaScript and HTML |
| **Chetan Konathala** | CSS styling |
| **Julianna Schwartz** | Bootstrap implementation and responsive styling |
| **Caiden Young** | HTML structure, homepage and sign-up page development |

<details>
<summary><strong>Contributions by feature</strong></summary>

| Feature | Contributors |
|---|---|
| **Homepage** | Ava Smolley (HTML, CSS, Bootstrap); Caiden Young (HTML, CSS) |
| **Sign Up** | Griffin Crothers (JavaScript); Anatoly DelGuerico (HTML, JavaScript); Chetan Konathala (CSS); Julianna Schwartz (Bootstrap); Caiden Young (HTML) |
| **Sessions** | Griffin Crothers (JavaScript, validation); Anatoly DelGuerico (JSON); Chetan Konathala (CSS); Julianna Schwartz (Bootstrap); Ava Smolley (jQuery); Caiden Young (HTML) |
| **Shopping Cart** | Griffin Crothers (JavaScript); Anatoly DelGuerico (JSON/AJAX); Chetan Konathala (CSS); Julianna Schwartz (Bootstrap); Ava Smolley (jQuery); Caiden Young (HTML) |
| **React Migration** | Ava Smolley (ported existing HTML, CSS, JavaScript, and interactivity to React) |

</details>

## Limitations and Roadmap

This is a front-end project, so some features are intentionally out of scope for now.

**Current limitations**
- No backend or database; session changes are not saved across refreshes
- The cart does not connect to a checkout flow
- No user authentication or admin permissions

**Planned improvements**
- [ ] Backend API with persistent storage
- [ ] Persistent session edits
- [ ] Complete checkout workflow

---

<div align="center">

**Academic Team Project · Penn State University · IST 256**

</div>
