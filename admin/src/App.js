import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLogin   from "./pages/AdminLogin";
import AdminLayout  from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";
import AdminTicketDetail from "./pages/AdminTicketDetail";
import AdminUsers   from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";

function PrivateRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: "#9CA3AF" }}>Loading...</div>;
  return admin ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard"         element={<AdminDashboard />} />
            <Route path="tickets"           element={<AdminTickets />} />
            <Route path="tickets/:id"       element={<AdminTicketDetail />} />
            <Route path="users"             element={<AdminUsers />} />
            <Route path="users/:id"         element={<AdminUserDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
