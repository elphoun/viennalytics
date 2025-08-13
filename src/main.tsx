// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './root.css';
import AppProviders from './context/Providers';
import Opening from './explorer/Opening';
import Homepage from './homepage/Homepage';
import Report from './report/Report';

/** Main router configuration for the application. */
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

/** Main entry point for the React application. Renders the app with providers and router. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
  </StrictMode>,
);
