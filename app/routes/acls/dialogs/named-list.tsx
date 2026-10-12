import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import TokenList from "~/components/token-list";
import { isValidGroupName, isValidTagName } from "~/utils/acl-policy";

export type NamedListKind = "group" | "tag";

interface NamedListDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  kind: NamedListKind;
  // Present when editing, absent when creating a new entry.
  name?: string;
  members?: string[];
  existingNames: string[];
  suggestions: string[];
  onSave: (name: string, members: string[]) => void;
}

export default function NamedListDialog({
  isOpen,
  setIsOpen,
  kind,
  name,
  members,
  existingNames,
  suggestions,
  onSave,
}: NamedListDialogProps) {
  const { t } = useTranslation();
  const prefix = kind === "group" ? "group:" : "tag:";
  const validate = kind === "group" ? isValidGroupName : isValidTagName;
  const [draftName, setDraftName] = useState(name ?? prefix);
  const [draftMembers, setDraftMembers] = useState<string[]>(members ?? []);

  useEffect(() => {
    if (isOpen) {
      setDraftName(name ?? prefix);
      setDraftMembers(members ? [...members] : []);
    }
  }, [isOpen, name, members, prefix]);

  const trimmedName = draftName.trim();
  const isDuplicate = trimmedName !== name && existingNames.includes(trimmedName);
  const nameIsInvalid = !validate(trimmedName) || isDuplicate;
  const isPristine = trimmedName.length === 0 || trimmedName === prefix;
  const showNameError = !isPristine && nameIsInvalid;

  const titleKey = kind === "group"
    ? (name ? t("acls.editGroup", { name }) : t("acls.newGroup"))
    : (name ? t("acls.editTag", { name }) : t("acls.newTag"));
  const hintKey = kind === "group" ? t("acls.groupNameHint") : t("acls.tagNameHint");
  const existsKey = kind === "group" ? t("acls.groupExists") : t("acls.tagExists");
  const fieldKey = kind === "group" ? t("acls.members") : t("acls.tagOwners");
  const fieldDescKey = kind === "group" ? t("acls.membersDesc") : t("acls.tagOwnersDesc");
  const emptyKey = kind === "group" ? t("acls.noMembersYet") : t("acls.noOwnersYet");

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={nameIsInvalid}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(trimmedName, draftMembers);
          setIsOpen(false);
        }}
      >
        <Title>{titleKey}</Title>
        <Text>{hintKey}</Text>
        <Input
          errorMessage={isDuplicate ? existsKey : hintKey}
          invalid={showNameError}
          label={t("acls.name")}
          onChange={setDraftName}
          placeholder={`${prefix}example`}
          value={draftName}
        />
        <TokenList
          description={fieldDescKey}
          emptyText={emptyKey}
          label={fieldKey}
          onChange={setDraftMembers}
          placeholder={kind === "group" ? "alice@" : "group:ops"}
          suggestions={suggestions}
          values={draftMembers}
        />
      </DialogPanel>
    </Dialog>
  );
}
