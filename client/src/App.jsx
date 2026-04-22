import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import CustomerTable from "./components/CustomerTable";
import "./App.css";

export default function App() {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="splash">
        <div className="splash-ring" />
        <span className="splash-label">MileExp</span>
      </div>
    );
  }

  return user ? <CustomerTable /> : <Login />;
}
