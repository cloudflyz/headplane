import { useTranslation } from "react-i18next";

import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export function HeadplaneAgentTag() {
  const { t } = useTranslation();
  return (
    <Tooltip content="This machine is running the Headplane agent, which allows it to provide host information in the web UI.">
      <Chip
        text={t("tags.headplaneAgent")}
        className={cn("bg-purple-300 text-purple-900 dark:bg-purple-900 dark:text-purple-300")}
      />
    </Tooltip>
  );
}
