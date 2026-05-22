import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark" || storedTheme === "light") {
  document.documentElement.classList.toggle("dark", storedTheme === "dark");
} else {
  document.documentElement.classList.add("dark");
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root not found");
}

createRoot(root).render(<App />);
