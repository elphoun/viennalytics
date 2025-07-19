import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { cn } from "./components/utils";
import './root.css';
import Opening from './explorer/Opening';
import Homepage from './homepage/Homepage';
import Report from './report/Report';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />
  }, {
    path: "/report",
    element: <Report />
  }, {
    path: "/explorer",
    element: <Opening />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className={cn('overflow-y-scroll text-white select-none scrollbar-thin')}>
      <RouterProvider router={router} />
    </div>
  </StrictMode>,
);
