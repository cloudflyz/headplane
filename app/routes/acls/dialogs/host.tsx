import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { isValidHostName } from "~/utils/acl-policy";

interface HostDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  name?: string;
  value?: string;
  existingNames: string[];
  onSave: (name: string, value: string) => void;
}

export default function HostDialog({
  isOpen,
  setIsOpen,
  name,
  value,
  existingNames,
  onSave,
}: HostDialogProps) {
  const { t } = useTranslation();
  const [draftName, setDraftName] = useState(name ?? "");
  const [draftValue, setDraftValue] = useState(value ?? "");

  useEffect(() => {
    if (isOpen) {
      setDraftName(name ?? "");
      setDraftValue(value ?? "");
    }
  }, [isOpen, name, value]);

  const isDuplicate = draftName !== name && existingNames.includes(draftName);
  const nameIsInvalid = !isValidHostName(draftName) || isDuplicate;
  const valueIsInvalid = draftValue.trim().length === 0;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={nameIsInvalid || valueIsInvalid}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draftName, draftValue.trim());
          setIsOpen(false);
        }}
      >
        <Title>{name ? t("acls.editHost", { name }) : t("acls.newHost")}</Title>
        <Text>
          {t("acls.hostDesc")}
        </Text>
        <Input
          errorMessage={
            isDuplicate
              ? t("acls.hostExists")
              : t("acls.hostNameRule")
          }
          invalid={nameIsInvalid}
          label={t("acls.name")}
          onChange={setDraftName}
          placeholder="office"
          value={draftName}
        />
        <Input
          invalid={draftValue.length > 0 && valueIsInvalid}
          label={t("acls.address")}
          onChange={setDraftValue}
          placeholder="100.64.0.0/24"
          value={draftValue}
        />
      </DialogPanel>
    </Dialog>
  );
}
