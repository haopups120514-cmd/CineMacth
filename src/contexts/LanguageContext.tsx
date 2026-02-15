"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Locale } from "@/i18n/translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "zh",
  setLocale: () => {},
  t: () => "",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const saved = localStorage.getItem("cinematch-locale") as Locale | null;
    if (saved && (saved === "zh" || saved === "en" || saved === "ja")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("cinematch-locale", newLocale);
    // 更新 html lang 属性
    document.documentElement.lang = newLocale === "zh" ? "zh" : newLocale === "ja" ? "ja" : "en";
  }, []);

  const t = useCallback(
    (namespace: string, key: string): string => {
      return translations[locale]?.[namespace]?.[key] || translations["zh"]?.[namespace]?.[key] || key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export { LanguageContext };
