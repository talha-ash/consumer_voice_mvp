import { createRoot } from "react-dom/client";
import "../shared/userSocket";
import ClientApp from "./ClientApp";
import "./main.css";
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ClientApp />);
}
