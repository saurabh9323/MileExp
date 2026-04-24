# MileExp — Banking Analytics Dashboard

A full-stack MERN application built as part of the Vistaar Digital Communications assessment. It features Firebase authentication, a customer analytics dashboard, clickable account transactions, and MongoDB aggregation queries.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend | https://mile-exp.vercel.app |
| Backend API | https://mile-exp-eriq.vercel.app/api |
| Health Check | https://mile-exp-eriq.vercel.app/api/health |

---

## 📋 Assessment Requirements

| Task | Description | Status |
|---|---|---|
| Task 1 | Login page using third-party OAuth (Firebase) | ✅ Done |
| Task 2 | List active customers with Name, Address, Accounts columns | ✅ Done |
| Task 2b | Clickable accounts showing linked transactions | ✅ Done |
| Task 3 | MongoDB query — account IDs with at least one transaction below $5000 | ✅ Done |
| Task 4 | MongoDB query — distinct list of products in the system | ✅ Done |

---

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** + Custom CSS Variables
- **Firebase SDK** — Google OAuth + Email/Password auth
- **Axios** — API calls with JWT interceptor
- **React Context** — Auth state + Theme (dark/light mode)

### Backend
- **Node.js** with Express
- **MongoDB** + Mongoose ODM
- **Firebase Admin SDK** — JWT verification middleware
- **bcryptjs** — Password hashing
- **jsonwebtoken** — Custom JWT generation
- Deployed on **Vercel**

---

## 📁 Project Structure

```
mileexp-mern/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx          # Sign in / Sign up page
│   │   │   ├── CustomerTable.jsx  # Main dashboard
│   │   │   ├── TransactionModal.jsx  # Account transactions popup
│   │   │   └── UserProfile.jsx    # User profile modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Firebase + custom JWT auth
│   │   │   └── ThemeContext.jsx   # Dark / Light mode
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + API calls
│   │   ├── firebase.js            # Firebase config
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env                       # Frontend environment variables
│
└── server/                        # Express backend
    ├── models/
    │   ├── Account.js             # Account schema
    │   ├── Customer.js            # Customer schema (with tier_and_details)
    │   ├── Transaction.js         # Transaction bucket schema
    │   └── User.js                # User schema (for custom auth)
    ├── routes/
    │   ├── auth.js                # POST /signup, POST /signin, GET /me
    │   ├── customers.js           # GET /customers, GET /customers/stats
    │   ├── accounts.js            # GET /accounts, GET /accounts/products
    │   └── transactions.js        # GET /transactions/account/:id, GET /low-amount
    ├── middleware/
    │   └── auth.js                # Firebase token verification middleware
    ├── scripts/
    │   └── seedData.js            # Seeds MongoDB from JSON files
    ├── server.js                  # Express app entry point
    └── .env                       # Backend environment variables
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project

### 1. Clone the repository
```bash
git clone https://github.com/saurabh9323/MileExp.git
cd mileexp-mern
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mileexp
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=your_jwt_secret_key
```

Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173**

---

## 🔐 Authentication

The app uses a **dual authentication system**:

### Firebase Auth
- Google OAuth sign-in
- Email/Password sign-in and sign-up
- Firebase issues a **JWT token** (ID token) after login
- Token is attached to every API request via Axios interceptor
- Backend verifies it using **Firebase Admin SDK**

### Custom Backend JWT
- On email signup/signin, user is also saved to **MongoDB** `users` collection
- Backend generates its own **JWT** containing `uid`, `name`, `email`, `provider`
- Token expires in **7 days**
- Used for `/api/auth/me` endpoint

```
POST /api/auth/signup   →  { name, email, password }
POST /api/auth/signin   →  { email, password }
GET  /api/auth/me       →  Authorization: Bearer <token>
```

---

## 📊 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login with email/password |
| GET | `/api/auth/me` | Get current user info |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List customers (pagination, search, filter) |
| GET | `/api/customers/stats` | Total, active, inactive counts |

### Accounts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/accounts` | List all accounts |
| GET | `/api/accounts/products` | **Task 4** — Distinct products list |
| GET | `/api/accounts/:account_id` | Single account by ID |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions/account/:id` | All transactions for an account |
| GET | `/api/transactions/low-amount` | **Task 3** — Accounts with txn < $5000 |
| GET | `/api/transactions/stats` | Transaction statistics |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server + DB connection status |

---

## 🗄️ MongoDB Queries

### Task 3 — Account IDs with at least one transaction below $5,000

```javascript
db.transactions.aggregate([
  { $unwind: "$transactions" },
  { $match: { "transactions.amount": { $lt: 5000 } } },
  { $group: { _id: "$account_id" } },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, account_id: "$_id" } }
])
```

### Task 4 — Distinct list of products

```javascript
db.accounts.distinct("products")
// Returns: ["Brokerage", "Commodity", "CurrencyService", "Derivatives", "InvestmentFund", ...]
```

---

## 🗃️ Database Schema

### Customer
```json
{
  "username": "david77",
  "name": "Aaron Perez",
  "address": "55375 Malone Trail Suite 506, South Miguelland, MS 55765",
  "birthdate": "1982-08-07",
  "email": "alexaortega@hotmail.com",
  "active": true,
  "accounts": [744220, 126092, 187107, 437371, 413293],
  "tier_and_details": {
    "c21c8e5c...": {
      "tier": "Gold",
      "benefits": ["airline lounge access", "financial planning assistance"],
      "active": true,
      "id": "c21c8e5c..."
    }
  }
}
```

### Transaction (Bucket Pattern)
```json
{
  "account_id": 744220,
  "transaction_count": 86,
  "bucket_start_date": "1983-08-01",
  "bucket_end_date": "2016-05-20",
  "transactions": [
    {
      "date": "1983-08-01",
      "amount": 3431,
      "transaction_code": "buy",
      "symbol": "amd",
      "price": "14.97",
      "total": "51300.00"
    }
  ]
}
```

---

## ✨ Features

- 🔐 **Firebase Authentication** — Google OAuth + Email/Password
- 🔑 **Dual JWT System** — Firebase token + custom backend token
- 📋 **Customer Dashboard** — Paginated table with search and filter
- 💳 **Clickable Accounts** — Modal showing full transaction history
- ⚑ **Transaction Flagging** — Transactions below $5,000 highlighted in red
- 🏅 **Tier & Benefits** — Gold/Silver/Platinum tier display with benefits
- 🌙 **Dark/Light Mode** — Theme toggle with localStorage persistence
- 👤 **User Profile** — Shows decoded JWT payload, tier info, linked accounts
- 📊 **Stats Bar** — Total, active, inactive customers + product count
- 🔍 **Search** — Real-time search by name, email, username
- 📄 **Pagination** — 15 records per page with page navigation

---

## 🚢 Deployment

Both frontend and backend are deployed on **Vercel**.

### Deploy Backend
```bash
cd server
npx vercel --prod
```

### Deploy Frontend
```bash
cd client
npm run build
npx vercel --prod
```

### Environment Variables on Vercel
Set all `.env` variables in:
> Vercel Dashboard → Project → Settings → Environment Variables

---

## 👨‍💻 Author

**Saurabh Pathak**
- GitHub: [@saurabh9323](https://github.com/saurabh9323)
- Email: saurabh.pathak52@gmail.com

---

## 📄 License

This project was built as part of a technical assessment for **Vistaar Digital Communications Pvt. Ltd.**
