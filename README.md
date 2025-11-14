# Kobra Kai Web Application

## Overview
Kobra Kai is a full-stack web application composed of a Node.js/Express REST API and a React single-page application built with Vite. The API handles authentication, meal management, order processing, and push notification subscriptions backed by MongoDB. The client consumes the API, manages state with modern React tooling, and provides a progressive web app experience with service worker support.

The repository is organized into two top-level workspaces:

- `api/` — Express server, business logic, MongoDB models, and push notification services.
- `client/` — React front end served by Vite with routing, state management, and PWA assets.

## Prerequisites

- **Node.js** v18 or newer (includes `npm`).
- **MongoDB** instance accessible to the API (local or hosted Atlas cluster).
- Optional: A pair of VAPID keys if you plan to enable web push notifications.

## Initial Setup

1. Clone the repository and move into the project directory:
   ```bash
   git clone <your-fork-or-clone-url>
   cd Kobra-Kai-Web-Application
   ```
2. Install dependencies for each workspace:
   ```bash
   cd api
   npm install

   cd ../client
   npm install
   ```

## Environment Configuration

Create `.env` files in both the `api/` and `client/` directories before running the application.

### API (`api/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | Defaults to `development`; set to `production` for optimized logging/cookies. |
| `PORT` | No | Port for the API server (default `4000`). |
| `MONGO_URI` | **Yes** | MongoDB connection string (e.g., `mongodb://localhost:27017/kobrakai`). |
| `JWT_SECRET` | **Yes** | Secret used to sign JSON Web Tokens. |
| `CORS_ORIGIN` | No | Front-end origin allowed for CORS. Defaults to `http://localhost:4173`. |
| `VAPID_PUBLIC_KEY` | No | Public key for web push. Needed if using push notifications. |
| `VAPID_PRIVATE_KEY` | No | Private key for web push. |
| `VAPID_SUBJECT` | No | Contact email/URL associated with VAPID keys. |

### Client (`client/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | Base URL for API requests. Defaults to `http://localhost:4000/api`. |
| `VITE_VAPID_PUBLIC_KEY` | No | Public VAPID key exposed to the client for push subscriptions. Required if enabling push. |

> **Tip:** Generate VAPID keys with [`web-push`](https://github.com/web-push-libs/web-push#command-line) (`npx web-push generate-vapid-keys`) and share the public key with the client.

## Running the Application

Open two terminal sessions (one for the API and one for the client).

### Start the API (Express server)
```bash
cd api
npm run dev
```
- Runs the API on `http://localhost:4000` with automatic restarts via Nodemon.
- Health check endpoint: `GET http://localhost:4000/api/health`.

To run in production mode:
```bash
npm start
```

### Start the Client (React + Vite)
```bash
cd client
npm run dev
```
- Vite will output a local development URL (commonly `http://localhost:5173`).
- The client proxies API requests to the URL defined by `VITE_API_URL`.

For a production build:
```bash
npm run build
npm run preview
```
`npm run build` creates static assets in `client/dist/`, and `npm run preview` serves the production bundle locally.

## Testing & Linting

- **API tests:**
  ```bash
  cd api
  npm test
  ```
- **Client linting:**
  ```bash
  cd client
  npm run lint
  ```

## Additional Notes

- Ensure MongoDB is running and accessible before starting the API to avoid connection errors.
- When enabling push notifications, serve the client over HTTPS (or `http://localhost` during development) so the service worker can register successfully.
- Update the `CORS_ORIGIN` environment variable when deploying the client to a different domain.

You're now ready to develop, test, and deploy the Kobra Kai web application!
