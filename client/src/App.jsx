/**
 * App.jsx — Root with routing and providers
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TaskProvider } from './context/TaskContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AllTasks from './pages/AllTasks.jsx';
import Archived from './pages/Archived.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/tasks"    element={<AllTasks />} />
            <Route path="/archived" element={<Archived />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#242424',
              color: '#F0EBE1',
              border: '1px solid #3D3D3D',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
          }}
        />
      </TaskProvider>
    </BrowserRouter>
  );
}
