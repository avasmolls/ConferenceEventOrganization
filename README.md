# ConferenceEventOrganization
Project repository for team project in IST 256 class at Penn State. This project will implement HTML, CSS, JavaScript, Node.Js, CRUD Operations, and more with end-to-end functionality.  

# index.html
Home page for the website. Includes a simple navigation bar at the top for easy, clear use. Also gives a brief on what the website is for, with a call-to-action button for new users to sign up.

# signup.html
User sign-up page for the website, carrying over the same navigation bar. It has a responsive form using HTML using JavaScript to validate inputs.

### Install and run
 
```bash
git clone https://github.com/avasmolls/ConferenceEventOrganization.git
cd ConferenceEventOrganization/conference-app
npm install
npm run dev
```
 
Open the local URL Vite prints (usually `http://localhost:5173`).
 
> Run all npm commands from inside the `conference-app` folder. The app must run through the dev server. Opening the HTML directly in a browser (`file://`) will not work, because pages load `sessions.json` with `fetch`.
 
### Scripts
 
| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
