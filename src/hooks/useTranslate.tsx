"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateText, translateBatch, needsTranslation } from "@/lib/translate";
import type { Locale } from "@/i18n/translations";

/**
 * useAutoTranslate - 自动翻译单个文本
 * @param text 原始文本
 * @param skip 是否跳过翻译（如：目标语言是中文时跳过中文数据）
 */
export function useAutoTranslate(text: string, skip = false): string {
  const { locale } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const prevRef = useRef({ text, locale });

  useEffect(() => {
    // 数据源是中文，所以只在中文 locale 下跳过翻译
    if (skip || !text || !needsTranslation(text, locale)) {
      setTranslated(text);
      return;
    }

    // 避免闪烁：如果只是 locale 变了，先显示原文
    if (prevRef.current.text !== text || prevRef.current.locale !== locale) {
      prevRef.current = { text, locale };
    }

    let cancelled = false;
    translateText(text, locale).then((result) => {
      if (!cancelled) setTranslated(result);
    });

    return () => { cancelled = true; };
  }, [text, locale, skip]);

  return translated;
}

/**
 * useAutoTranslateBatch - 批量翻译多个文本
 */
export function useAutoTranslateBatch(
  texts: string[],
  skip = false
): string[] {
  const { locale } = useLanguage();
  const [translated, setTranslated] = useState(texts);
  const textsKey = texts.join("||");

  useEffect(() => {
    if (skip || !texts.length) {
      setTranslated(texts);
      return;
    }

    // 如果所有文本都不需要翻译，跳过
    const anyNeedsTranslation = texts.some((t) => t && needsTranslation(t, locale));
    if (!anyNeedsTranslation) {
      setTranslated(texts);
      return;
    }

    let cancelled = false;
    translateBatch(texts, locale).then((results) => {
      if (!cancelled) setTranslated(results);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textsKey, locale, skip]);

  return translated;
}

/**
 * TranslatedText - 自动翻译文本组件
 * 用法: <TranslatedText text="你好世界" />
 */
export function TranslatedText({
  text,
  as: Component = "span",
  className,
}: {
  text: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  className?: string;
}) {
  const translated = useAutoTranslate(text);

  return <Component className={className}>{translated}</Component>;
}

/**
 * 翻译已知枚举值（补偿类型、状态等）
 * 不通过 API，而是使用本地映射
 */
const enumTranslations: Record<string, Record<Locale, string>> = {
  // 补偿类型
  "有薪": { zh: "有薪", en: "Paid", ja: "有給" },
  "包食宿": { zh: "包食宿", en: "Room & Board", ja: "食事・宿泊付き" },
  "互免": { zh: "互免", en: "Mutual Exchange", ja: "相互協力" },
  "可谈": { zh: "可谈", en: "Negotiable", ja: "応相談" },
  "志愿": { zh: "志愿", en: "Volunteer", ja: "ボランティア" },
  // 项目状态
  "招募中": { zh: "招募中", en: "Recruiting", ja: "募集中" },
  "已满员": { zh: "已满员", en: "Full", ja: "募集終了" },
  "拍摄中": { zh: "拍摄中", en: "In Production", ja: "撮影中" },
  // 项目类型
  "短片": { zh: "短片", en: "Short Film", ja: "短編映画" },
  "毕设": { zh: "毕设", en: "Thesis Film", ja: "卒業制作" },
  "MV": { zh: "MV", en: "Music Video", ja: "MV" },
  "广告": { zh: "广告", en: "Commercial", ja: "CM" },
  "纪录片": { zh: "纪录片", en: "Documentary", ja: "ドキュメンタリー" },
  // 职业角色
  "摄影": { zh: "摄影", en: "Cinematography", ja: "撮影" },
  "灯光": { zh: "灯光", en: "Lighting", ja: "照明" },
  "美术": { zh: "美术", en: "Art Direction", ja: "美術" },
  "录音": { zh: "录音", en: "Sound", ja: "録音" },
  "导演": { zh: "导演", en: "Director", ja: "監督" },
  "摄影师": { zh: "摄影师", en: "Cinematographer", ja: "撮影監督" },
  "灯光师": { zh: "灯光师", en: "Gaffer", ja: "照明技師" },
  "录音师": { zh: "录音师", en: "Sound Recordist", ja: "録音技師" },
  "美术指导": { zh: "美术指导", en: "Art Director", ja: "美術監督" },
  "制片人": { zh: "制片人", en: "Producer", ja: "プロデューサー" },
  "副导演": { zh: "副导演", en: "Assistant Director", ja: "助監督" },
  "编剧": { zh: "编剧", en: "Screenwriter", ja: "脚本家" },
  "剪辑师": { zh: "剪辑师", en: "Editor", ja: "編集者" },
  // 视觉风格
  "日系": { zh: "日系", en: "Japanese Style", ja: "邦画風" },
  "赛博": { zh: "赛博", en: "Cyberpunk", ja: "サイバー" },
  "胶片": { zh: "胶片", en: "Film", ja: "フィルム" },
  "纪实": { zh: "纪实", en: "Documentary", ja: "ドキュメンタリー" },
  "复古": { zh: "复古", en: "Retro", ja: "レトロ" },
  // 设备
  "有车": { zh: "有车", en: "Has Car", ja: "車あり" },
  "无人机": { zh: "无人机", en: "Drone", ja: "ドローン" },
  "稳定器": { zh: "稳定器", en: "Stabilizer", ja: "スタビライザー" },
};

export function translateEnum(value: string, locale: Locale): string {
  return enumTranslations[value]?.[locale] || value;
}

/**
 * useTranslateEnum - 翻译枚举值钩子
 */
export function useTranslateEnum() {
  const { locale } = useLanguage();
  return (value: string) => translateEnum(value, locale);
}
