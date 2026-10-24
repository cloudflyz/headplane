import { useTranslation } from "react-i18next";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface ExpiryTagProps {
  variant: "expired" | "no-expiry";
  expiry?: string;
}

export function ExpiryTag({ variant, expiry }: ExpiryTagProps) {
  const { t } = useTranslation();
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Tooltip
      content={
        variant === "expired" ? (
          <>
            This machine is expired and will not be able to connect to the network. Re-authenticate
            with Tailscale on the machine to re-enable it.
          </>
        ) : (
          <>This machine has key expiry disabled and will never need to re-authenticate.</>
        )
      }
    >
      <Chip
        text={
          variant === "expired"
            ? `${t("common.expired")} ${formatter.format(new Date(expiry!))}`
            : t("common.noExpiry")
        }
        className="bg-mist-200 text-mist-800 dark:bg-mist-800 dark:text-mist-200"
      />
    </Tooltip>
  );
}
