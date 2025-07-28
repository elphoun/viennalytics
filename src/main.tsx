// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { cn } from "./components/utils";
import './root.css';
import AppProviders from './context/Providers';
import Opening from './explorer/Opening';
import Homepage from './homepage/Homepage';
import Report from './report/Report';

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────

/**
 * Main router configuration for the application.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />
  }, {
    path: "/report",
    element: <Report />
  }, {
    path: "/explorer/",
    element: <Opening />
  }
]);

// ─ Helper Functions ─────────────────────────────────────────────────────────────────────────────

/**
 * Main entry point for the React application. Renders the app with providers and router.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className={cn('h-screen w-screen text-white select-none scrollbar-thin')}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </div>
  </StrictMode>,
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
// (No exports in this file)
