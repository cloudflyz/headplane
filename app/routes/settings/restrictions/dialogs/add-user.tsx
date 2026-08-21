import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";

const userSchema = type({
  user: "string > 0",
});

interface AddUserProps {
  users: string[];
  isDisabled?: boolean;
}

export default function AddUser({ users, isDisabled }: AddUserProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: userSchema,
    validate: (values) => {
      const user = (values.user as string).trim();
      if (user.length === 0) return undefined;

      if (users.includes(user)) {
        return { user: t("restrictions.userExists") };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("restrictions.addUser")}</Button>
      <DialogPanel>
        <Title>{t("restrictions.addUser")}</Title>
        <Text className="mb-4">{t("restrictions.addUserDesc")}</Text>
        <input name="action_id" type="hidden" value="add_user" />
        <Input
          {...form.field("user")}
          description={t("restrictions.userDesc")}
          required
          label={t("restrictions.user")}
          placeholder="john_doe"
        />
      </DialogPanel>
    </Dialog>
  );
}
