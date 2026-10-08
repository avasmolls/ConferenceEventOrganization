# ConferenceEventOrganization
Project repository for team project in IST 256 class at Penn State. This project will implement HTML, CSS, JavaScript, Node.Js, CRUD Operations, and more with end-to-end functionality.  

# index.html
Home page for the website. Includes a simple navigation bar at the top for easy, clear use. Also gives a brief on what the website is for, with a call-to-action button for new users to sign up.

# signup.html
User sign-up page for the website, carrying over the same navigation bar. It has a responsive form using HTML using JavaScript to validate inputs.

# css/styles.css
The site's design system — all visual styling for both pages lives here as one
external stylesheet, loaded after Bootstrap so it owns the final look. Built on
CSS custom properties: colour, type scale, spacing, radius and motion are all
tokens on `:root`, so the whole site can be rethemed from a single block. Ships
a dark default theme and a light theme that honours the OS preference, a full
form-validation state system bound to Bootstrap's standard `.is-invalid` /
`.is-valid` classes, a responsive attendee table that becomes stacked cards
below 768px, and accessibility support (visible focus rings, `prefers-reduced-motion`,
`prefers-contrast`, print styles). See **DESIGN.md** for the full documentation.

# js/app.js
Shared behaviour for both pages: theme toggle (persisted to `localStorage`),
mobile navigation, sticky-header state, scroll-reveal via `IntersectionObserver`,
animated stat counters, the agenda day switcher, and a reusable toast helper
exposed as `window.Converge.toast()`.

# js/signup.js
Registration logic for `signup.html`. Validates all five required fields plus
the optional phone number against a single rule table, writes each submission
to a JSON register, and renders that register as a table (cards on mobile) with
working **update** and **delete**. The register persists in `localStorage` and
can be downloaded as `attendees.json` or copied to the clipboard. The original
field ids (`tbEmail`, `tbName`, `tbAge`, `tbAddress`) and the global
`validateData()` entry point are preserved, so earlier logic still works.

# data/attendees.json
Sample attendee register showing the JSON structure each submission produces —
one object per attendee with `id`, `fullName`, `email`, `phone`, `age`,
`affiliation`, `track`, `tier`, `wantsUpdates`, `checkedIn` and `registeredAt`.

# DESIGN.md
Full design-system documentation: tokens, type scale, signature visual devices,
the form-state system and its integration contract, responsive breakpoints,
accessibility decisions, and how the custom CSS layers over Bootstrap.

---

## Group contributions

| Member | Section | Files |
|---|---|---|
| Chetan Konathala | **CSS & visual design** — design system, both page layouts, the full form-validation state system, responsive behaviour, accessibility, dark/light theming | `css/styles.css`, `DESIGN.md`, styling and structure of `index.html` + `signup.html` |

> Teammates: add your row above. The HTML structure and JavaScript sections are
> owned by other members — `js/signup.js` is a reviewed working baseline, and the
> styling is deliberately bound to Bootstrap's standard `.is-invalid` /
> `.is-valid` classes so any validation logic you write plugs straight in
> without touching the CSS.
