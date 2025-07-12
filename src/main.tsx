import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './root.css';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import OpeningPage from './pages/OpeningPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  }, {
    path: "/report",
    element: <ReportPage />
  }, {
    path: "/explorer",
    element: <OpeningPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
