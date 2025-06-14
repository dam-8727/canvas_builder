# Canvas Builder 🎨🖌️

A full-stack web application that lets users compose shapes, images, and text on an HTML canvas and export the result as a flattened, print-ready PDF.

* **Frontend:** React (Create-React-App) → deployed on [Netlify](https://canvabuilder.netlify.app/).
* **Backend:** Express.js REST API → deployed on Render at <https://canvas-backend-vv91.onrender.com>.

---

## Live demos

| Layer | URL |
|-------|-----|
| Frontend | <https://canvabuilder.netlify.app/> |
| Backend (health) | <https://canvas-backend-vv91.onrender.com> |

---

## Project structure

```
canvas_builder/
├─ canvas_backend/      # Express server + routes
│  ├─ server.js
│  └─ routes/
├─ canvas_frontend/     # React application (CRA)
│  ├─ public/
│  └─ src/
├─ package.json         # Root scripts (delegates to packages)
├─ .node-version        # Pins Node 20 LTS
└─ README.md            # ← you are here
```

---

## Prerequisites

* **Node.js 20** (pinned via `.node-version` and `"engines"` field)
* **npm 9+**

---

## Local development

1. **Clone** the repo:
   ```bash
   git clone https://github.com/<your-user>/canvas_builder.git
   cd canvas_builder
   ```

2. **Install** dependencies for both packages (root `postinstall` does this automatically):
   ```bash
   npm install
   ```

3. **Environment variables** (frontend):
   • Create `canvas_frontend/.env` with
   ```bash
   REACT_APP_API_BASE=
   ```
   keeping it empty so requests proxy to `localhost:5001`.

4. **Start the backend**
   ```bash
   npm start            # runs `node server.js` in canvas_backend on port 5001
   ```

5. **Start the frontend** in another terminal:
   ```bash
   npm run start:frontend   # CRA dev-server at http://localhost:3000
   ```

   The frontend proxy (declared in `canvas_frontend/package.json`) forwards `/canvas/*` calls to the backend.

---

## Useful scripts (package root)

| Script | Purpose |
|--------|---------|
| `npm start` | Starts **backend** (`canvas_backend`)
| `npm run start:frontend` | Starts **frontend** dev server
| `npm run build` | Builds the React app into `canvas_frontend/build/`

---

## Deployment

### Backend on Render

Render automatically installs dependencies and starts the backend using the root `start` script. Important notes:

* Render sets `process.env.PORT`; `server.js` listens on `PORT || 5001`.
* No `.env` file is required for port.
* Native module `canvas` compiles in Render's Linux build stage (root `.gitignore` prevents committing `node_modules`).

### Frontend on Netlify

1. **Build command**: `npm run build`  
2. **Publish directory**: `canvas_frontend/build`  
3. **Environment variable**:  
   `REACT_APP_API_BASE=https://canvas-backend-vv91.onrender.com`

Netlify injects the var at build time; the compiled bundle will call the remote backend.

---

## API endpoints (backend)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/export-pdf` | Accepts base64 image and returns a flattened PDF |


---

## License

MIT © 2025 Canvas Builder
