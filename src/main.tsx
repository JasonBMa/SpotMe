import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./routes/App";
import Callback from './routes/Callback';
import Home from './routes/Home';
import './main.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/Callback",
    element: <Callback />,
  },
  {
    path: "/Home",
    element: <Home />,
  },
]);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
