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
import { supabase } from "@/lib/supabase";

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

    // 同步语言偏好到数据库（已登录用户）
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ preferred_locale: newLocale })
            .eq("id", user.id);
        }
      } catch {
        // 静默失败，不影响本地切换
      }
    })();
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
