import "../shared/setup";
import { createRoot } from "react-dom/client";
import "../shared/userSocket";
import ClientApp from "./ClientApp";
import "./main.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";

const rootElement = document.getElementById("root");
export const queryClient = new QueryClient();

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClientApp />
    </QueryClientProvider>
    // </StrictMode>
  );
}
