// 语言切换器组件 — 独立组件，减少官方文件修改
import { useTranslation } from "react-i18next";

import { supportedLanguages } from "~/i18n";
import cn from "~/utils/cn";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      aria-label="Language"
      className={cn(
        "rounded-md border border-mist-300 bg-mist-100 px-3 py-1.5 text-sm",
        "text-mist-800 dark:text-mist-200",
        "dark:border-mist-600 dark:bg-mist-800",
        "hover:bg-mist-200 dark:hover:bg-mist-700",
        "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1",
        "dark:focus:ring-indigo-400/40 dark:focus:ring-offset-mist-900",
      )}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem("headplane-language", e.target.value);
      }}
      value={i18n.language}
    >
      {supportedLanguages.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
