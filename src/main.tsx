import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { Header } from "./components/header.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GridLoader } from "./grid/grid-loader.tsx";

const theme = localStorage.getItem("theme");

let finalTheme = "dark";

if (theme === "system") {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkMode) finalTheme = "dark";
  else finalTheme = "light";
} else if (theme === "dark") {
  finalTheme = "dark";
} else {
  finalTheme = "light";
}

if (finalTheme === "light") document.body.classList.add("light");
else document.body.classList.add("ln-teal");

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <ThemeProvider>
      <StrictMode>
        <div className="flex flex-col h-screen">
          <div className="h-header w-full-client flex flex-col border-b border-gray-200 bg-gray-50 px-6">
            <Header />
          </div>
          <h1 className="text-center text-2xl text-primary-900 py-2">
            Server Data Loading - TypeScript Reference Demo
          </h1>
          <div className="mx-auto container flex-1 p-4 lng-grid">
            <div className="border border-gray-300 h-full w-full rounded-xl overflow-hidden">
              <GridLoader />
            </div>
          </div>
        </div>
      </StrictMode>
    </ThemeProvider>
  </QueryClientProvider>,
);
