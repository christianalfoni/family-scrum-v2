import { AppContext } from "./AppContext";
import { useGlobalContext } from "./useGlobalContext";
import { Suspense, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "next-intl";
import "tailwindcss/tailwind.css";
import "swiper/swiper.scss";
import "./global.css";
import { Skeleton } from "./AppContext/Dashboard/Skeleton";

// Import locale messages
import enSession from "../messages/session/en.json";
import enApp from "../messages/app/en.json";
import noSession from "../messages/session/no.json";
import noApp from "../messages/app/no.json";

const messages = {
  en: { ...enSession, ...enApp },
  no: { ...noSession, ...noApp },
};

function getLocale(): "en" | "no" {
  const stored = localStorage.getItem("locale");
  if (stored === "en" || stored === "no") return stored;

  const browserLang = navigator.language.split("-")[0];
  return browserLang === "no" ? "no" : "en";
}

function App() {
  const [locale] = useState(getLocale);
  const msgs = useMemo(() => messages[locale], [locale]);
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  return (
    <IntlProvider locale={locale} messages={msgs} timeZone={timeZone}>
      <Suspense fallback={<Skeleton />}>
        <useGlobalContext.Provider>
          <AppContext />
        </useGlobalContext.Provider>
      </Suspense>
    </IntlProvider>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(<App />);
