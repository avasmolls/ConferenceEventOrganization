
<div align="center">

# Conference Event Organization

### A React-based conference management and registration application

A responsive web application designed to simplify conference planning, session management, attendee registration, and ticket selection.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

**Penn State University | IST 256 | Team Project**

</div>

---

## Project Overview

Conference Event Organization is a collaborative web development project created for IST 256 at The Pennsylvania State University.

The application provides a centralized interface for conference organizers and attendees to manage event sessions, register participants, browse available events, and build a shopping cart of session tickets.

The project was initially developed using HTML, CSS, Bootstrap, JavaScript, jQuery, JSON, and AJAX. As development progressed, the application was migrated to React to introduce a reusable component architecture, improve maintainability, and simplify the management of interactive features.

### Project Objectives

- Develop a responsive, accessible interface for conference participants.
- Implement interactive session management and ticket selection.
- Validate user input and provide clear feedback.
- Dynamically load and display conference data.
- Apply modern frontend development practices using React.
- Collaborate across multiple technologies using Git and GitHub.

---

## Key Features

### 1. Conference Homepage

The homepage introduces the conference and provides navigation to the application's main features.

**Functionality:**
- Responsive homepage built using React and Bootstrap.
- Featured conference sessions populated dynamically from JSON.
- Navigation to attendee registration and session management.
- Conference information and calls to action.
- Reusable interface elements and responsive layouts.

### 2. Session Management

The session management interface allows users to create, edit, search, and browse conference sessions.

**Functionality:**
- Add sessions with an ID, title, category, format, price, and speaker.
- Edit existing sessions using automatically populated form fields.
- Validate session information before submission.
- Prevent duplicate session IDs when adding sessions.
- Search sessions dynamically without refreshing the page.
- Load initial session information using the Fetch API.
- Display session information in responsive ticket-style cards.

Session updates are currently maintained in React state rather than a persistent database.

### 3. Attendee Sign-Up

The attendee sign-up page allows participants to enter their information and view registered attendees.

**Functionality:**
- Collect attendee name, email, age, and company.
- Validate form inputs using JavaScript regular expressions.
- Store attendee information using browser `localStorage`.
- Display registered attendees in a searchable table.
- Filter attendees by name, email, or company.
- Manage form values and attendee records using React state.

### 4. Conference Registration

The conference registration page allows attendees to register for individual sessions.

**Functionality:**
- Retrieve available sessions from JSON data.
- Select a conference session and participation type.
- Support in-person, virtual, and VIP participation options.
- Validate participant information and optional notes.
- Check for duplicate registrations.
- Display confirmation or error feedback.
- Save registration information in browser storage.

The registration component includes a configurable API integration structure. Backend persistence is not currently enabled.

### 5. Shopping Cart

The shopping cart allows attendees to select conference sessions and calculate ticket costs.

**Functionality:**
- Browse available sessions loaded from JSON.
- Search sessions by name or price.
- Add sessions to the cart.
- Prevent duplicate cart entries.
- Remove sessions from the cart.
- Automatically calculate ticket totals.
- Validate session/product information through an additional form.

The shopping cart currently operates on the frontend. Checkout and payment processing have not been implemented.

---

## Technology Stack

| Technology | Implementation |
|------------|----------------|
| React 19 | Component-based interface and state management |
| JavaScript ES6+ | Application logic, events, and validation |
| HTML5 | Semantic structure and form elements |
| CSS3 | Custom styling and layout |
| Bootstrap 5 | Responsive grid, forms, and components |
| React Router | Client-side navigation |
| Vite 8 | Development server and build tooling |
| JSON | Initial session data |
| Fetch API | Asynchronous data retrieval |
| localStorage | Browser-side attendee and registration persistence |
| Git & GitHub | Version control and team collaboration |

### React Architecture

The application uses React functional components and Hooks to manage its frontend behavior.

- `useState` manages forms, sessions, attendee data, search values, and cart contents.
- `useEffect` handles initial data fetching and synchronization with browser storage.
- React Router provides navigation without requiring full-page reloads.
- Reusable components reduce duplicated markup and simplify maintenance.

The migration from jQuery-based interactions to React allows interface updates to be driven by component state rather than direct DOM manipulation.

---

## Getting Started

### Prerequisites

Before running the project, install:

- [Node.js](https://nodejs.org/) (compatible with Vite 8)
- npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/avasmolls/ConferenceEventOrganization.git
```

**2. Navigate to the application directory**

```bash
cd ConferenceEventOrganization/conference-app
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Open the local development URL shown in the terminal, typically:

```text
http://localhost:5173
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Generates a production build |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs Oxlint static analysis |

Run these commands from the `conference-app` directory.

---

## Application Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home.jsx | Conference landing page and featured sessions |
| `/signup` | Signup.jsx | Attendee sign-up and attendee directory |
| `/sessions` | Sessions.jsx | Session creation, editing, and browsing |
| `/cart` | Cart.jsx | Session ticket selection and cart totals |
| `/register` | Register.jsx | Individual conference session registration |

---

## Project Structure

```text
ConferenceEventOrganization/
│
├── README.md
│
└── conference-app/
    │
    ├── public/
    │   └── sessions.json
    │
    ├── src/
    │   ├── assets/
    │   │
    │   ├── components/
    │   │   └── Navbar.jsx
    │   │
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Sessions.jsx
    │   │   ├── Cart.jsx
    │   │   └── Register.jsx
    │   │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    │
    ├── index.html
    ├── package.json
    └── vite.config.js
```

### Application Organization

**Components:** Shared interface elements such as the navigation bar.

**Pages:** Individual React components responsible for each application feature.

**Assets:** Images and visual resources used throughout the application.

**Public Data:** JSON files containing the initial conference sessions.

**App.jsx:** Defines the application's routes and shared layout.

---

## Technical Implementation

### Dynamic Session Rendering

Conference information is loaded asynchronously from `sessions.json` using the Fetch API.

The returned data is stored in React state and displayed dynamically within application components.

This allows the interface to render sessions from a common data source rather than relying entirely on hardcoded HTML.

### Form Validation

JavaScript regular expressions and conditional validation are used throughout the application.

Validation includes:
- Required input fields.
- Email address formatting.
- Session and product ID formats.
- Numeric ticket prices.
- Participant names.
- Duplicate session IDs.
- Duplicate conference registrations.

Validation results are communicated through form messages, alerts, and other interface feedback.

### Search and Filtering

Search functionality is implemented using React state and JavaScript array methods.

As users enter search terms, the application filters the relevant data and re-renders the visible results.

This approach avoids unnecessary page reloads or manual DOM manipulation.

### Browser Storage

The application uses `localStorage` for attendee and registration information.

Session management changes and shopping cart selections currently use component-level state.

Because no shared backend database is connected, some information resets when the application is refreshed.

### Migrating from jQuery to React

A significant part of development involved restructuring the original multi-page website into a React application.

The migration included:
- Converting HTML pages into JSX components.
- Replacing direct DOM manipulation with React state.
- Converting jQuery event handlers into React event handlers.
- Replacing jQuery-based JSON retrieval with the Fetch API.
- Implementing client-side routing.
- Preserving existing functionality while reorganizing application logic.

This transition helped establish a more maintainable frontend structure and provided practical experience modernizing an existing application.

---

## Team and Contributions

This application was developed collaboratively by six students at The Pennsylvania State University.

| Team Member | Primary Contributions |
|-------------|----------------------|
| **Ava Smolley** | React migration, JSX component conversion, integration of existing functionality, jQuery-to-React transition, homepage development |
| **Griffin Crothers** | JavaScript functionality, session management logic, validation, sign-up functionality |
| **Anatoly DelGuerico** | JSON data integration, AJAX, sign-up functionality |
| **Chetan Konathala** | CSS styling and interface presentation |
| **Julianna Schwartz** | Bootstrap implementation and responsive layouts |
| **Caiden Young** | HTML structure, homepage and sign-up development |

### Feature Contribution Breakdown

| Feature | Contributions |
|---------|---------------|
| Homepage | Ava Smolley — HTML, CSS, Bootstrap; Caiden Young — HTML, CSS |
| Attendee Sign-Up | Griffin Crothers — JavaScript; Anatoly DelGuerico — HTML/JavaScript; Chetan Konathala — CSS; Julianna Schwartz — Bootstrap; Caiden Young — HTML |
| Session Management | Griffin Crothers — JavaScript/validation; Anatoly DelGuerico — JSON; Chetan Konathala — CSS; Julianna Schwartz — Bootstrap; Ava Smolley — jQuery; Caiden Young — HTML |
| Shopping Cart | Griffin Crothers — JavaScript; Anatoly DelGuerico — JSON/AJAX; Chetan Konathala — CSS; Julianna Schwartz — Bootstrap; Ava Smolley — jQuery; Caiden Young — HTML |
| Conference Registration | Griffin Crothers — JavaScript; Anatoly DelGuerico — JSON/AJAX; Chetan Konathala — CSS; Julianna Schwartz — Bootstrap; Ava Smolley — jQuery functionality and React integration; Caiden Young — HTML |
| React Migration | Ava Smolley — Converting existing HTML, CSS, JavaScript, and interactive functionality into React components |

---

## Development Challenges and Learning Outcomes

### Migrating Existing Functionality

One of the primary challenges was converting an existing multi-page application into React while preserving previously implemented functionality.

The original application relied on conventional JavaScript and jQuery interactions. React required these interactions to be restructured around component state, declarative rendering, and event handling.

### Integrating Team Contributions

Because individual team members worked on different features and technologies, integration required coordinating changes across HTML, CSS, Bootstrap, JavaScript, JSON, and React.

Version control and clear component organization were important for combining these contributions.

### Managing Dynamic Data

Implementing JSON-driven session information, search features, and browser-side persistence provided experience working with asynchronous data and interactive frontend applications.

### Skills Developed

- React component design and migration.
- JavaScript and JSX development.
- Client-side routing.
- State management with React Hooks.
- Form handling and validation.
- Asynchronous data fetching.
- Responsive interface development.
- Collaborative Git and GitHub workflows.
- Debugging and integrating existing code.

---

## Current Limitations

The application is an academic frontend development project and is still being improved.

Current limitations include:

- No connected production backend or database.
- Session edits are not persisted across refreshes.
- Cart contents are maintained in component state.
- Checkout and payment processing are not implemented.
- Authentication and administrator permissions are not implemented.
- Some API integration functionality remains experimental.

---

## Future Improvements

Potential improvements include:

- [ ] Integrate a backend API for sessions and registrations.
- [ ] Add persistent database storage.
- [ ] Implement account authentication and user roles.
- [ ] Complete the checkout workflow.
- [ ] Improve shared state management between pages.

---

## Project Takeaways

Conference Event Organization provided hands-on experience building and modernizing a collaborative web application.

The project demonstrates practical skills in frontend development, React architecture, dynamic data rendering, input validation, responsive interface design, and team-based software development.

A major learning experience was migrating an existing JavaScript application into React while integrating contributions from multiple developers.

The project continues to serve as an opportunity to develop stronger frontend engineering practices and expand the application toward a more complete conference management platform.

---

## Repository

**GitHub:** [Conference Event Organization](https://github.com/avasmolls/ConferenceEventOrganization)

**Institution:** The Pennsylvania State University

**Course:** IST 256

**Project Type:** Collaborative Web Application

**Status:** In Development

---

<div align="center">

**Developed collaboratively for IST 256 at Penn State University.**

</div>
