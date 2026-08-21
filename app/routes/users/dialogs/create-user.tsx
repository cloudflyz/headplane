import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";

interface CreateUserProps {
  isOidc?: boolean;
  isDisabled?: boolean;
}

export default function CreateUser({ isOidc, isDisabled }: CreateUserProps) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("users.addUser")}</Button>
      <DialogPanel>
        <Title>{t("users.createUserTitle")}</Title>
        <Text className="mb-6">
          {isOidc ? t("users.createUserDescOidc") : t("users.createUserDesc")}
        </Text>
        <input name="action_id" type="hidden" value="create_user" />
        <div className="flex flex-col gap-4">
          <Input
            required
            label={t("users.username")}
            name="username"
            placeholder="my-new-user"
            type="text"
          />
          <Input
            label={t("users.displayName")}
            name="display_name"
            placeholder="John Doe"
            type="text"
          />
          <Input
            label={t("users.email")}
            name="email"
            placeholder="name@example.com"
            type="email"
          />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
