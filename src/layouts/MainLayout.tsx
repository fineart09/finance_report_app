import { NavLink, Outlet } from 'react-router-dom';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">Finance Report</div>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/create-expense" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Create Expense
          </NavLink>
          <NavLink to="/expense" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Expense
          </NavLink>
          <NavLink to="/partner" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Partner
          </NavLink>
        </nav>

        <button type="button" className="login-button">
          Login: Narin (Manager)
        </button>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
