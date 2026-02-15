/**
 * 用户内容自动翻译服务
 * 使用 Google Translate 免费 API 实现客户端翻译
 * 翻译结果缓存在内存 + localStorage 中
 */

import type { Locale } from "@/i18n/translations";

// 语言代码映射
const localeToLang: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en",
  ja: "ja",
};

// 内存缓存
const memoryCache = new Map<string, string>();

// localStorage 缓存 key
const CACHE_KEY = "cinematch-translate-cache";
const CACHE_MAX_SIZE = 500;

// 从 localStorage 加载缓存
function loadCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// 保存缓存到 localStorage
function saveCache(cache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    // 限制缓存大小
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX_SIZE) {
      const trimmed: Record<string, string> = {};
      keys.slice(-CACHE_MAX_SIZE).forEach((k) => (trimmed[k] = cache[k]));
      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch {
    // 忽略 quota 错误
  }
}

function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}:${text}`;
}

/**
 * 翻译单个文本
 */
export async function translateText(
  text: string,
  targetLocale: Locale,
  sourceLocale?: Locale
): Promise<string> {
  if (!text || !text.trim()) return text;

  const targetLang = localeToLang[targetLocale];
  const cacheKey = getCacheKey(text, targetLang);

  // 1. 检查内存缓存
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. 检查 localStorage 缓存
  const diskCache = loadCache();
  if (diskCache[cacheKey]) {
    memoryCache.set(cacheKey, diskCache[cacheKey]);
    return diskCache[cacheKey];
  }

  // 3. 调用翻译 API
  try {
    const sl = sourceLocale ? localeToLang[sourceLocale] : "auto";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Translation API error");

    const data = await resp.json();
    // Google API 返回格式: [[["translated text","source text",null,null,x],...],null,"detected_lang"]
    let translated = "";
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translated = data[0].map((seg: unknown[]) => seg[0]).join("");
    }

    if (translated) {
      memoryCache.set(cacheKey, translated);
      diskCache[cacheKey] = translated;
      saveCache(diskCache);
      return translated;
    }

    return text;
  } catch {
    return text; // 翻译失败时返回原文
  }
}

/**
 * 批量翻译多个文本（减少请求数）
 */
export async function translateBatch(
  texts: string[],
  targetLocale: Locale,
  sourceLocale?: Locale
): Promise<string[]> {
  if (!texts.length) return [];

  const targetLang = localeToLang[targetLocale];
  const results: (string | null)[] = new Array(texts.length).fill(null);
  const toTranslate: { index: number; text: string }[] = [];

  const diskCache = loadCache();

  // 先检查缓存
  texts.forEach((text, i) => {
    if (!text || !text.trim()) {
      results[i] = text;
      return;
    }
    const cacheKey = getCacheKey(text, targetLang);
    if (memoryCache.has(cacheKey)) {
      results[i] = memoryCache.get(cacheKey)!;
    } else if (diskCache[cacheKey]) {
      memoryCache.set(cacheKey, diskCache[cacheKey]);
      results[i] = diskCache[cacheKey];
    } else {
      toTranslate.push({ index: i, text });
    }
  });

  // 需要翻译的文本
  if (toTranslate.length > 0) {
    // 将多个文本用特殊分隔符合并翻译以减少请求
    const SEPARATOR = "\n\u200B\n"; // 使用零宽空格作为分隔符
    const combined = toTranslate.map((t) => t.text).join(SEPARATOR);

    try {
      const sl = sourceLocale ? localeToLang[sourceLocale] : "auto";
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${targetLang}&dt=t&q=${encodeURIComponent(combined)}`;
      const resp = await fetch(url);

      if (resp.ok) {
        const data = await resp.json();
        let fullTranslation = "";
        if (Array.isArray(data) && Array.isArray(data[0])) {
          fullTranslation = data[0].map((seg: unknown[]) => seg[0]).join("");
        }

        // 按分隔符拆分回各个翻译
        const parts = fullTranslation.split(/\n\u200B?\n|\n\s*\n/);

        toTranslate.forEach((item, idx) => {
          const translated = parts[idx]?.trim() || item.text;
          results[item.index] = translated;

          const cacheKey = getCacheKey(item.text, targetLang);
          memoryCache.set(cacheKey, translated);
          diskCache[cacheKey] = translated;
        });

        saveCache(diskCache);
      } else {
        // API 错误时逐个回退
        toTranslate.forEach((item) => {
          results[item.index] = item.text;
        });
      }
    } catch {
      // 翻译失败时返回原文
      toTranslate.forEach((item) => {
        results[item.index] = item.text;
      });
    }
  }

  return results as string[];
}

/**
 * 判断文本是否需要翻译（是否已经是目标语言）
 */
export function needsTranslation(text: string, targetLocale: Locale): boolean {
  if (!text || !text.trim()) return false;

  // 简单启发式检测文本语言
  const hasChinese = /[\u4e00-\u9fff]/.test(text);
  const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
  const hasEnglish = /[a-zA-Z]{3,}/.test(text);

  if (targetLocale === "zh" && hasChinese && !hasJapanese) return false;
  if (targetLocale === "ja" && (hasJapanese || (hasChinese && !hasEnglish))) return false;
  if (targetLocale === "en" && hasEnglish && !hasChinese && !hasJapanese) return false;

  return true;
}
