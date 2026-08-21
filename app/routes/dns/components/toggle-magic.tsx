import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";

interface Props {
  isEnabled: boolean;
  isDisabled: boolean;
}

export default function Modal({ isEnabled, isDisabled }: Props) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <Button disabled={isDisabled}>
        {isEnabled ? t("dns.disable") : t("dns.enable")} {t("dns.magicDns")}
      </Button>
      <DialogPanel isDisabled={isDisabled}>
        <Title>
          {isEnabled ? t("dns.disable") : t("dns.enable")} {t("dns.magicDns")}
        </Title>
        <Text>{t("dns.toggleMagicDesc")}</Text>
        <input type="hidden" name="action_id" value="toggle_magic" />
        <input type="hidden" name="new_state" value={isEnabled ? "disabled" : "enabled"} />
      </DialogPanel>
    </Dialog>
  );
}
