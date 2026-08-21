import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";

const groupSchema = type({
  group: "string > 0",
});

interface AddGroupProps {
  groups: string[];
  isDisabled?: boolean;
}

export default function AddGroup({ groups, isDisabled }: AddGroupProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: groupSchema,
    validate: (values) => {
      const group = (values.group as string).trim();
      if (group.length === 0) return undefined;

      if (groups.includes(group)) {
        return { group: t("restrictions.groupExists") };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("restrictions.addGroup")}</Button>
      <DialogPanel>
        <Title>{t("restrictions.addGroup")}</Title>
        <Text className="mb-4">{t("restrictions.addGroupDesc")}</Text>
        <input name="action_id" type="hidden" value="add_group" />
        <Input
          {...form.field("group")}
          description={t("restrictions.groupDesc")}
          required
          label={t("restrictions.group")}
          placeholder="admin"
        />
      </DialogPanel>
    </Dialog>
  );
}
