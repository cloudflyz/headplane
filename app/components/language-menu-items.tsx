// 语言切换菜单项 — 独立组件，减少官方文件修改
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MenuItem } from "~/components/menu";
import { supportedLanguages } from "~/i18n";

export default function LanguageMenuItems() {
  const { i18n } = useTranslation();

  return (
    <>
      {supportedLanguages.map(({ code, label }) => (
        <MenuItem
          key={code}
          onClick={() => {
            i18n.changeLanguage(code);
            localStorage.setItem("headplane-language", code);
          }}
        >
          <div className="flex items-center gap-x-2">
            <Languages className="size-4" />
            <span className="flex-1">{label}</span>
            {i18n.language === code && <Check className="size-4" />}
          </div>
        </MenuItem>
      ))}
    </>
  );
}
