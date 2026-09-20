import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import App from './app/App';

const router = createBrowserRouter([{ path: "*", element: <><CssBaseline /><App /></> }]);

ReactDOM.createRoot(
  document.getElementById('root')!,
).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);