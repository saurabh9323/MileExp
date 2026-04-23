import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CustomerTable from "./components/CustomerTable";
import "./App.css";

export default function App() {
  const { user, loading } = useAuth();

  console.log("USER VALUE:", user);

  // ⛔ Wait until Firebase resolves
  if (loading) {
    return (
      <div className="splash">
        <div className="splash-ring" />
        <span className="splash-label">MileExp</span>
      </div>
    );
  }

  // ✅ After loading is DONE
  return user ? <CustomerTable /> : <Login />;
}