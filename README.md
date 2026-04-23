# project1

A full-stack app split into a React/Redux frontend and an Express/MongoDB backend, where users sign up, shop, and place orders while admins manage the product catalog.

**Frontend:** React 19, Redux Toolkit, React Router, Ant Design, Tailwind (CDN), Vite.

**Backend:** Express 5 (ES modules), MongoDB + Mongoose 9, JWT auth, Nodemailer (Gmail SMTP with Ethereal fallback).

## Roles

A **regular user** can browse products, add items to the cart, apply promo codes, and place orders.

An **admin** can do everything a regular user can, plus create, edit, and delete products.

## Project layout

```
proj1/
├── backend/
│   ├── controllers/      # auth, products, cart, orders, users
│   ├── middleware/       # authToken, error handler
│   ├── models/           # User, Product, Order
│   ├── routes/           # /api/auth, /api/products, /api/cart, /api/orders, /api/users
│   ├── utils/            # mailer, generateToken
│   └── index.js          # app entry
├── frontend/
│   ├── src/
│   │   ├── components/   # reusable UI pieces
│   │   ├── pages/        # route-level screens
│   │   ├── store/        # Redux slices + thunks
│   │   └── api/          # axios client
│   └── index.html
├── .env                  # gitignored, see below
└── package.json          # root workspace scripts
```

## Environment variables

The backend reads a single `.env` file at the repo root. Copy the template below into `.env` and fill in your own values.

**MONGO_URI** — MongoDB connection string.

**JWT_SECRET** — any string, used to sign auth tokens.

**JWT_EXPIRES_IN** — token lifetime, e.g. `7d`.

**PORT** — backend port (default `4000`).

**MAIL_USER / MAIL_PASS** — a Gmail address and its app password (spaces are stripped automatically). If either is missing, the mailer falls back to Ethereal and only prints a preview URL instead of actually sending mail.

**FRONTEND_URL** — the base URL the password-reset email links back to. Vite defaults to `http://localhost:5173`.

**ADMIN_EMAILS** — comma-separated exact email matches that should be auto-promoted to admin on signup.

**ADMIN_DOMAINS** — comma-separated email-suffix matches (must start with `@`) that should be auto-promoted to admin on signup. If left blank, the code falls back to `@maildrop.cc`.

## Admin whitelist

On registration, the backend checks the new user's email against `ADMIN_EMAILS` (exact match) and `ADMIN_DOMAINS` (suffix match). Matching emails get `isAdmin: true` automatically — useful for seeding a demo admin without a separate promotion step. Everyone else signs up as a regular user.

## Running locally

1. Clone the repo and `cd` into it.
2. Create a `.env` file at the repo root and fill in the variables listed above.
3. Install dependencies for both backend and frontend in one shot: `npm run install:all`
4. In one terminal, start the backend: `npm run dev:backend` (nodemon will watch `backend/` and restart on save).
5. In another terminal, start the frontend: `npm run dev:frontend` (Vite dev server on port 5173).

If `nodemon: command not found` shows up, you're probably running `npm run dev` from inside `backend/` before installing — run `npm run install:all` from the repo root first.

## API

**Auth** — `POST /api/auth/signup`, `POST /api/auth/signin`, `GET /api/auth/me`, `POST /api/auth/request-reset`, `POST /api/auth/confirm-reset`.

**Products** — `GET /api/products`, `GET /api/products/:id`, `POST /api/products` (admin), `PUT /api/products/:id` (admin), `DELETE /api/products/:id` (admin).

**Cart** — `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:productId`, `DELETE /api/cart/:productId`.

**Orders** — `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders/:id`.

**Users** — `GET /api/users/me`, `PUT /api/users/me`.

Protected routes require `Authorization: Bearer <token>`; 
admin-only routes additionally require `isAdmin: true` on the user.

## Promo codes

Three codes are hard-coded in the checkout logic for demo purposes:

**20 DOLLAR OFF** — flat 20 off the subtotal.

**WELCOME10** — 10% off the subtotal.

**TAKE5** — 5% off the subtotal.

Tax is applied to the discounted subtotal, not the original.

## Password reset flow

The user clicks "forgot password" and submits their email. The backend generates a random 32-byte token, saves it on the user with a 1-hour expiry, and emails a link of the form `${FRONTEND_URL}/reset-password?token=...`. When the user opens the link and submits a new password, the backend looks up the token, verifies it hasn't expired, writes the new password (Mongoose's `pre('save')` hook hashes it), and clears the token.

## Stack notes

Backend is pure ES modules (`"type": "module"` in `backend/package.json`) and uses the Node 20 `--env-file` flag to load `.env` without `dotenv`. Express 5 is used, so async route handlers propagate rejections into the error middleware automatically. Mongoose schemas handle password hashing and the `matchPassword` helper. The frontend talks to the backend through a single axios instance that injects the JWT from Redux into every request.
