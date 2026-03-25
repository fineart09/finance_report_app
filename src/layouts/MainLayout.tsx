import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './MainLayout.css';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">Finance Report</div>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
        >
          <span className="menu-toggle-line" />
          <span className="menu-toggle-line" />
          <span className="menu-toggle-line" />
        </button>

        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={handleNavClick}>
            Dashboard
          </NavLink>
          <NavLink to="/create-expense" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={handleNavClick}>
            Create Expense
          </NavLink>
          <NavLink to="/expense" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={handleNavClick}>
            Expense
          </NavLink>
          <NavLink to="/partner" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={handleNavClick}>
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
