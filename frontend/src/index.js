import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ReportRangeProvider } from "./context/ReportRangeContext";
import "./index.css";
import "./styles/globals.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    <LanguageProvider>
      <ReportRangeProvider>
        <App />
      </ReportRangeProvider>
    </LanguageProvider>
  </ThemeProvider>,
);
