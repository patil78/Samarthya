import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";

// Automatically route API requests to production backend if deployed
const PRODUCTION_API_URL = process.env.REACT_APP_API_URL;
if (PRODUCTION_API_URL) {
  // Configure Axios
  axios.defaults.baseURL = PRODUCTION_API_URL;
  axios.interceptors.request.use((config) => {
    if (config.url && (config.url.includes("localhost:8000") || config.url.includes("127.0.0.1:8000"))) {
      config.url = config.url.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/g, PRODUCTION_API_URL);
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Configure Fetch API
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    if (typeof input === "string" && (input.includes("localhost:8000") || input.includes("127.0.0.1:8000"))) {
      input = input.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/g, PRODUCTION_API_URL);
    }
    return originalFetch(input, init);
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
