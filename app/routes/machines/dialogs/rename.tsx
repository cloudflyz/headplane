import { type } from "arktype";
import { Trans, useTranslation } from "react-i18next";

import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import type { Machine } from "~/types";

const renameSchema = type({
  name: "string > 0",
});

const dnsLabelPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

interface RenameProps {
  machine: Machine;
  isOpen: boolean;
  magic?: string;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Rename({ machine, magic, isOpen, setIsOpen }: RenameProps) {
  const { t } = useTranslation();
  const validateMachineName = (values: Record<string, unknown>) => {
    const name = String(values.name ?? "").toLowerCase();
    if (!dnsLabelPattern.test(name)) {
      return {
        name: t("machine.nameValidation"),
      };
    }
  };
  const form = useForm({
    schema: renameSchema,
    defaultValues: { name: machine.givenName },
    validate: validateMachineName,
  });
  const name = form.values.name as string;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel isDisabled={!form.canSubmit}>
        <Title>{t("machine.rename", { name: machine.givenName })}</Title>
        <Text className="mb-6">{t("machine.renameDesc")}</Text>
        <input name="action_id" type="hidden" value="rename" />
        <input name="node_id" type="hidden" value={machine.id} />
        <Input
          {...form.field("name")}
          required
          label={t("machine.machineName")}
          placeholder={t("machine.machineName")}
        />
        {magic ? (
          name.length > 0 && name !== machine.givenName ? (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              <Trans
                components={{
                  0: <Code className="text-sm">{name.toLowerCase().replaceAll(/\s+/g, "-")}</Code>,
                  1: <Code className="text-sm">{machine.givenName}</Code>,
                }}
                i18nKey="machine.hostnameInfo"
                values={{
                  hostname: name.toLowerCase().replaceAll(/\s+/g, "-"),
                  oldName: machine.givenName,
                }}
              />
            </p>
          ) : (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              <Trans
                components={{
                  0: <Code className="text-sm">{machine.givenName}</Code>,
                }}
                i18nKey="machine.hostnameCurrent"
                values={{ hostname: machine.givenName }}
              />
            </p>
          )
        ) : undefined}
      </DialogPanel>
    </Dialog>
  );
}
