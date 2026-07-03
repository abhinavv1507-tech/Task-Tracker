/**
 * Sidebar Layout Component
 * — includes hamburger toggle for mobile
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiList, FiArchive, FiZap, FiMenu, FiX,
} from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext.jsx';

const NAV_ITEMS = [
  { to: '/',         icon: FiGrid,    label: 'Dashboard' },
  { to: '/tasks',    icon: FiList,    label: 'All Tasks' },
  { to: '/archived', icon: FiArchive, label: 'Archived' },
];

export default function Sidebar() {
  const { pagination } = useTaskContext();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
      >
        <FiMenu size={22} />
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        {/* Close button (mobile only) */}
        <button
          className="sidebar-close-btn"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <FiX size={20} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FiZap size={16} />
          </div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <span className="sidebar-nav-label">Menu</span>

          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
              {label === 'All Tasks' && pagination?.totalCount > 0 && (
                <span className="nav-badge">{pagination.totalCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar" aria-hidden="true">A</div>
          <span className="user-name">Abhinav</span>
        </div>
      </aside>
    </>
  );
}
