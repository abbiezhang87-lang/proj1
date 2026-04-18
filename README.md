# Project 1
- **Frontend:** Vite + React 19 + Redux Toolkit (createAsyncThunk) + React Router v7 + Ant Design + Axios
- **Backend:** Express 5 + Mongoose + MongoDB (ES modules) + JWT auth + bcrypt

Two user roles:
- **Regular user** — browse products, search, manage cart (with promo code).
- **Admin** — everything above plus create / edit / delete products. Auto-assigned to any email ending in `@maildrop.cc`.

## Project layout

```
proj1/
├── .env                           # MongoDB URI + JWT secret (shared by backend)
├── package.json                   # Convenience dev scripts
├── backend/                       # Express API (ES modules, "type": "module")
│   ├── index.js                   # App entry
│   ├── config/db.js
│   ├── controllers/{auth,product,cart,user}.js
│   ├── middleware/{auth,errorHandler}.js
│   ├── models/{User,product,Cart}.js
│   ├── routes/{auth,product,cart,user}.js
│   ├── utils/generateToken.js
│   └── error/index.js             # CustomAPIError class
└── frontend/
    ├── index.html
    ├── vite.config.js             # Proxies /api → http://localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx                # Router + ErrorBoundary + Layout
        ├── api/                   # Axios instance + endpoint wrappers
        ├── app/store.js           # Redux store
        ├── features/
        │   ├── auth/authSlice.js      # thunks: signIn, signUp, updatePassword, fetchMe
        │   ├── product/productSlice.js
        │   └── cart/cartSlice.js
        ├── components/
        │   ├── AuthForm.jsx           # Reusable — SignIn / SignUp / UpdatePassword
        │   ├── ProductForm.jsx        # Reusable — Create / Edit
        │   ├── Header.jsx / Footer.jsx / Layout.jsx
        │   ├── ProductCard.jsx / CartDrawer.jsx
        │   ├── ProtectedRoute.jsx     # Route guard (auth / admin)
        │   └── ErrorBoundary.jsx
        ├── pages/
        │   ├── auth/{SignIn,SignUp,UpdatePassword}.jsx
        │   ├── product/{ProductList,ProductDetail,CreateProduct,EditProduct}.jsx
        │   └── error/ErrorPage.jsx
        └── utils/validators.js
```

## Running locally

```bash
# 1. Install (from project root)
npm run install:all

# 2. Start the backend (Node 20.6+ reads .env via --env-file)
npm run dev:backend
# → http://localhost:5000

# 3. Start the frontend (separate terminal)
npm run dev:frontend
# → http://localhost:5173 — proxies /api to :5000
```

## API

All endpoints live under `/api`.

### Auth
| Method | Route                  | Auth         | Purpose                    |
|--------|------------------------|--------------|----------------------------|
| POST   | `/api/auth/signup`     | –            | `{ name, email, password }`|
| POST   | `/api/auth/signin`     | –            | `{ email, password }`      |
| GET    | `/api/auth/me`         | user         | Rehydrate current user     |
| PUT    | `/api/auth/password`   | user         | `{ currentPassword, newPassword }` |

### Products
| Method | Route                  | Auth   | Purpose                                       |
|--------|------------------------|--------|-----------------------------------------------|
| GET    | `/api/products`        | –      | `?page=&limit=&q=&sort=priceAsc\|priceDesc\|latest` |
| GET    | `/api/products/:id`    | –      | Detail                                        |
| POST   | `/api/products`        | admin  | Create                                        |
| PUT    | `/api/products/:id`    | admin  | Update                                        |
| DELETE | `/api/products/:id`    | admin  | Delete                                        |

### Cart (user scoped)
| Method | Route                      | Auth |
|--------|----------------------------|------|
| GET    | `/api/cart`                | user |
| POST   | `/api/cart/items`          | user |
| PUT    | `/api/cart/items/:pid`     | user |
| DELETE | `/api/cart/items/:pid`     | user |
| POST   | `/api/cart/promo`          | user |
| DELETE | `/api/cart`                | user |

### Valid promo codes (demo)

- `20 DOLLAR OFF` → $20 off
- `WELCOME10`     → 10% off

## Phase coverage

- **Phase I** Sign in / Sign up / Update password — one `AuthForm` component, three routes; frontend + backend validation; header + footer; responsive.
- **Phase II** Product APIs + list / create / edit pages — one `ProductForm` shared by Create + Edit.
- **Phase III** Role-guarded Add/Edit/Delete buttons; cart persists across refresh (localStorage for guests, Mongo for logged-in users); pagination; search; promo code; `ErrorBoundary` at root.
