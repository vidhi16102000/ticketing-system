import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/layout.module.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.brand}>🎫 SupportDesk</div>
        <div className={styles.links}>
          <NavLink to="/dashboard"  className={({ isActive }) => isActive ? styles.linkActive : styles.link}>Dashboard</NavLink>
          <NavLink to="/chat"       className={({ isActive }) => isActive ? styles.linkActive : styles.link}>Raise Ticket</NavLink>
          <NavLink to="/my-tickets" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>My Tickets</NavLink>
        </div>
        <div className={styles.right}>
          <span className={styles.userName}>Hi, {user?.name}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
