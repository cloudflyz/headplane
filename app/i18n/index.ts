// i18n 配置：初始化 i18next + react-i18next
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import zhCNCommon from "./locales/zh-CN/common.json";

// 支持的语言列表
export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "简体中文" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];

// 默认语言
export const defaultLanguage: LanguageCode = "en";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      "zh-CN": { common: zhCNCommon },
    },
    fallbackLng: defaultLanguage,
    defaultNS: "common",
    ns: ["common"],
    interpolation: {
      escapeValue: false, // React 已经做了 XSS 防护
    },
    detection: {
      // 检测顺序：localStorage → navigator → htmlTag
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "headplane-language",
    },
    react: {
      useSuspense: false, // 避免 Suspense 边界问题
    },
  });

export default i18n;
