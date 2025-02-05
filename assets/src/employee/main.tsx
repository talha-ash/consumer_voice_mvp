import "../shared/setup";
import { createRoot } from "react-dom/client";
import "../shared/userSocket";
import EmployeeApp from "./EmployeeApp";
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootElement = document.getElementById("root");
export const queryClient = new QueryClient();

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
      <EmployeeApp />
    </QueryClientProvider>
    // </StrictMode>
  );
}
