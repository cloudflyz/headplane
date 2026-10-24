import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Link from "~/components/link";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import TokenList from "~/components/token-list";
import { KNOWN_SSH_ACTIONS, type SshRule } from "~/utils/acl-policy";

interface SshRuleDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  rule?: SshRule;
  sources: string[];
  destinations: string[];
  onSave: (rule: SshRule) => void;
}

const EMPTY: SshRule = { action: "accept", src: [], dst: [], users: [], extra: {} };
const SSH_USERS = ["root", "autogroup:nonroot"];

export default function SshRuleDialog({
  isOpen,
  setIsOpen,
  rule,
  sources,
  destinations,
  onSave,
}: SshRuleDialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SshRule>(rule ?? EMPTY);

  useEffect(() => {
    if (isOpen) {
      setDraft(rule ? structuredClone(rule) : structuredClone(EMPTY));
    }
  }, [isOpen, rule]);

  const isInvalid = draft.src.length === 0 || draft.dst.length === 0 || draft.users.length === 0;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={isInvalid}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
          setIsOpen(false);
        }}
      >
        <Title>{rule ? t("acls.editSshRule") : t("acls.newSshRule")}</Title>
        <Text>
          {t("acls.sshRuleDesc")}{" "}
          <Link external styled to="https://tailscale.com/kb/1193/tailscale-ssh">
            {t("acls.tailscaleSshDocs")}
          </Link>{" "}
          {t("acls.sshDocSuffix")}
        </Text>
        <Select
          items={[
            { value: "accept", label: t("acls.acceptLabel") },
            { value: "check", label: t("acls.checkLabel") },
            // An action we do not know is listed as-is so it survives an edit.
            ...(KNOWN_SSH_ACTIONS.includes(draft.action)
              ? []
              : [
                  {
                    value: draft.action,
                    label: t("acls.unknownActionLabel", { action: draft.action }),
                  },
                ]),
          ]}
          label={t("acls.action")}
          onValueChange={(value) => setDraft({ ...draft, action: value ?? draft.action })}
          value={draft.action}
        />
        <TokenList
          description={t("acls.sshSourcesDesc")}
          emptyText={t("acls.noSourcesYet")}
          label={t("acls.sources")}
          onChange={(src) => setDraft({ ...draft, src })}
          placeholder="group:ops"
          suggestions={sources}
          values={draft.src}
        />
        <TokenList
          description={t("acls.sshDestinationsDesc")}
          emptyText={t("acls.noDestinationsYet")}
          label={t("acls.destinations")}
          onChange={(dst) => setDraft({ ...draft, dst })}
          placeholder="tag:server"
          suggestions={destinations}
          values={draft.dst}
        />
        <TokenList
          description={t("acls.sshUsersDesc")}
          emptyText={t("acls.noSshUsersYet")}
          label={t("acls.sshUsers")}
          onChange={(users) => setDraft({ ...draft, users })}
          placeholder="autogroup:nonroot"
          suggestions={SSH_USERS}
          values={draft.users}
        />
        {draft.action === "check" ? (
          <Input
            description={t("acls.checkPeriodDesc")}
            label={t("acls.checkPeriod")}
            onChange={(checkPeriod) =>
              setDraft({ ...draft, checkPeriod: checkPeriod.length > 0 ? checkPeriod : undefined })
            }
            placeholder="12h"
            value={draft.checkPeriod ?? ""}
          />
        ) : null}
      </DialogPanel>
    </Dialog>
  );
}
