import { createRoot } from "react-dom/client";
import "../shared/userSocket";
import EmployeeApp from "./EmployeeApp";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<EmployeeApp />);
}
