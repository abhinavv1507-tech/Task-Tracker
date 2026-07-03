import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useKeyboardShortcuts
 *
 * Adds global keyboard shortcuts to the application:
 * - Cmd/Ctrl + N : Navigate to new task (if modal logic is global, or just route to tasks page and open modal if supported)
 * - Cmd/Ctrl + F : Focus search on All Tasks page
 * - Cmd/Ctrl + D : Go to Dashboard
 */
export default function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'f':
            e.preventDefault();
            // If we are not on tasks page, go there
            if (window.location.pathname !== '/tasks') {
              navigate('/tasks');
              // Use a slight delay to allow the page to render before focusing
              setTimeout(() => {
                const searchInput = document.getElementById('tasks-search');
                if (searchInput) searchInput.focus();
              }, 100);
            } else {
              const searchInput = document.getElementById('tasks-search');
              if (searchInput) searchInput.focus();
            }
            break;

          case 'd':
            e.preventDefault();
            navigate('/');
            break;
            
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
