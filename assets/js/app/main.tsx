import { createRoot } from "react-dom/client";
import App from "./App";
import "./user_socket";
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
