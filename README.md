# SevaGuide AI

A lightweight government-service discovery website with a Python service-search API and an in-page assistant.

## Run locally

1. Install Python 3.8 or newer.
2. Open a terminal in this folder.
3. Run `python server.py`.
4. Open `http://localhost:8000/` in a browser.

## Deploy the complete app

The website uses Python API routes (`/api/search`, `/api/suggest` and `/api/chat`). A static-only host such as GitHub Pages cannot run those routes. Deploy this repository as a **Python web service** instead; the included `render.yaml` configures Render to serve the frontend and API together.

1. Push the project files to a GitHub repository.
2. In Render, choose **New → Web Service** and connect that repository.
3. If Render does not detect `render.yaml` automatically, choose the Python runtime, set the build command to `pip install -r requirements.txt`, and the start command to `python server.py`.
4. Deploy, then open the `onrender.com` address Render gives you. Search and chat use the same origin as the page, so no separate API URL is needed.

The server reads Render's `PORT` setting and binds to `0.0.0.0`, as required for public web services. The small `requirements.txt` is intentional: this app currently has no third-party Python dependencies.

To keep using GitHub Pages for the frontend, you would also need to host the Python API separately and configure the frontend to use that API's public URL. The simplest option for this project is deploying the complete repository as the Python web service above.

The backend uses Python's standard library; no package installation is required. The assistant uses curated keyword matching and official source links. It does not connect to a hosted language model or government database.

## Project files

- `index.html` — page structure and service-details/chat UI
- `style.css` — responsive styling and visual theme
- `script.js` — search, live suggestions, results, and assistant interactions
- `server.py` — static file server, search API, and service guidance data

Service eligibility and application details can vary or change. Confirm current requirements on the linked government department website.
