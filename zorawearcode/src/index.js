import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { UserProvider } from "../src/Components/UserContext";
import { ToastContainer } from "react-toastify";
import './Styles/toast.css'
import "react-toastify/dist/ReactToastify.css";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
      <ToastContainer autoClose={2000} pauseOnHover={false} />
    </UserProvider>
 </React.StrictMode>
);
