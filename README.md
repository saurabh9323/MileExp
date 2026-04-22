# MileExp — MERN Banking Analytics Dashboard

> Full-stack MERN assessment for Vistaar Digital Communications Pvt. Ltd.

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | Firebase Google OAuth (client) + Firebase Admin SDK (server) |
| Deployment | Vercel (client + API) / Render (server) + MongoDB Atlas |

---

## Project Structure

```
mileexp-mern/
├── server/
│   ├── server.js               # Express entry point
│   ├── middleware/
│   │   └── auth.js             # Firebase Admin token verification
│   ├── models/
│   │   ├── Customer.js         # Mongoose schema
│   │   ├── Account.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── customers.js        # GET /api/customers (paginated, filtered)
│   │   ├── accounts.js         # GET /api/accounts/products (Task 4)
│   │   └── transactions.js     # GET /api/transactions/low-amount (Task 3)
│   ├── scripts/
│   │   └── seedData.js         # Import JSON data into MongoDB
│   ├── data/                   # JSON files converted from BSON dump
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── firebase.js         # Firebase client config
│   │   ├── App.jsx             # Auth-aware router
│   │   ├── App.css             # All styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state provider
│   │   ├── services/
│   │   │   └── api.js          # Axios + auto token injection
│   │   └── components/
│   │       ├── Login.jsx       # Google OAuth login page (Task 1)
│   │       ├── CustomerTable.jsx  # Customer list with accounts (Task 2)
│   │       └── TransactionModal.jsx  # Transaction drill-down (Task 2b)
│   └── .env.example
│
├── MONGO_QUERIES.md            # Tasks 3 & 4 queries
├── vercel.json                 # Vercel deployment config
└── package.json                # Root: runs both server + client
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI
- Firebase project with Google sign-in enabled

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment variables

**Server** — copy and fill in `server/.env.example` → `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/mileexp
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Client** — copy and fill in `client/.env.example` → `client/.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database
The `server/data/` folder already contains the pre-converted JSON from the BSON dump.
```bash
npm run seed
```

### 4. Run both server and client
```bash
npm run dev
```
- Client: http://localhost:5173
- API:    http://localhost:5000/api

---

## API Endpoints

All routes require a valid Firebase ID token in `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/customers` | List customers — `?active=true&search=&page=1&limit=15` |
| GET | `/api/customers/stats` | Total / active / inactive counts |
| GET | `/api/customers/:id` | Single customer |
| GET | `/api/accounts` | All accounts — `?ids=1,2,3` filter |
| GET | `/api/accounts/products` | **Task 4** — distinct product list |
| GET | `/api/accounts/:account_id` | Single account |
| GET | `/api/transactions/account/:id` | Transactions for an account |
| GET | `/api/transactions/low-amount` | **Task 3** — accounts with txn < `?threshold=5000` |
| GET | `/api/transactions/stats` | Bucket + transaction counts |

---

## MongoDB Queries

See **MONGO_QUERIES.md** for the raw queries used in Tasks 3 and 4.

### Task 3 — Account IDs with ≥ 1 transaction below $5,000
```js
db.transactions.aggregate([
  { $unwind: "$transactions" },
  { $match: { "transactions.amount": { $lt: 5000 } } },
  { $group: { _id: "$account_id" } },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, account_id: "$_id" } }
])
// → 1,731 accounts
```

### Task 4 — Distinct product list
```js
db.accounts.distinct("products")
// → ["Brokerage", "Commodity", "CurrencyService", "Derivatives", "InvestmentFund", "InvestmentStock"]
```

---

## Deployment

### MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string and set it as `MONGO_URI`
3. Run `npm run seed` with the Atlas URI

### Vercel (full-stack)
```bash
npm i -g vercel
vercel
```
Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Render (server only)
- Build command: `npm install`
- Start command: `node server.js`
- Root directory: `server/`
- Add all env vars in the Render dashboard
