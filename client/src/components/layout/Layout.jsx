/**
 * App Layout — wraps all pages with Sidebar + main content area
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts.js';

export default function Layout() {
  useKeyboardShortcuts();
  
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
