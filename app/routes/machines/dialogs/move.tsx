import { useState } from "react";
import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import type { Machine, User } from "~/types";
import { getUserDisplayName, sortUsersByDisplayName } from "~/utils/user";

interface MoveProps {
  machine: Machine;
  users: User[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Move({ machine, users, isOpen, setIsOpen }: MoveProps) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | null>(machine.user?.id ?? null);

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel isDisabled={userId === machine.user?.id}>
        <Title>{t("machine.changeOwnerTitle", { name: machine.givenName })}</Title>
        <Text>{t("machine.changeOwnerDesc")}</Text>
        <input name="action_id" type="hidden" value="reassign" />
        <input name="node_id" type="hidden" value={machine.id} />
        <input name="user_id" type="hidden" value={userId?.toString()} />
        <Select
          defaultValue={machine.user?.id}
          required
          label={t("machines.owner")}
          name="user"
          onValueChange={(key) => {
            setUserId(key);
          }}
          placeholder={t("machines.selectUser")}
          items={sortUsersByDisplayName(users).map((user) => ({
            value: user.id,
            label: getUserDisplayName(user),
          }))}
        />
      </DialogPanel>
    </Dialog>
  );
}
