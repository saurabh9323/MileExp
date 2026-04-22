import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// ── Customers ──
export const getCustomers = (params) => api.get("/customers", { params });
export const getCustomerStats = () => api.get("/customers/stats");

// ── Accounts ──
export const getAccounts = (ids) =>
  api.get("/accounts", { params: ids?.length ? { ids: ids.join(",") } : {} });
export const getProducts = () => api.get("/accounts/products");

// ── Transactions ──
export const getTransactionsByAccount = (account_id) =>
  api.get(`/transactions/account/${account_id}`);
export const getLowAmountAccounts = (threshold = 5000) =>
  api.get("/transactions/low-amount", { params: { threshold } });

export default api;
