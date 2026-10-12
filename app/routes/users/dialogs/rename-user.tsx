import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { User } from "~/types";
import { USERNAME_PATTERN, USERNAME_RULE } from "~/utils/user";

interface RenameProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function RenameUser({ user, isOpen, setIsOpen }: RenameProps) {
  const { t } = useTranslation();
  const name = user.name || user.displayName;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel>
        <Title>{t("users.renameUserTitle", { name })}</Title>
        <Text className="mb-6">{t("users.renameUserDesc", { name })}</Text>
        <input name="action_id" type="hidden" value="rename_user" />
        <input name="headscale_user_id" type="hidden" value={user.id} />
        <Input
          defaultValue={user.name}
          description={USERNAME_RULE}
          minLength={2}
          pattern={USERNAME_PATTERN}
          required
          title={USERNAME_RULE}
          label={t("users.username")}
          name="new_name"
          placeholder="my-new-name"
        />
      </DialogPanel>
    </Dialog>
  );
}
