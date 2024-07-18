import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./routes/App";
import SignedIn from './routes/SignedIn';
import './main.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/signedIn",
    element: <SignedIn />,
  },
]);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
