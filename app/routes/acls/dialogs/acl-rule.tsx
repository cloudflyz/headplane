import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Link from "~/components/link";
import Text from "~/components/text";
import Title from "~/components/title";
import TokenList from "~/components/token-list";
import { withDefaultPort, type AclRule } from "~/utils/acl-policy";

interface AclRuleDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  rule?: AclRule;
  sources: string[];
  destinations: string[];
  onSave: (rule: AclRule) => void;
}

const EMPTY: AclRule = { action: "accept", src: [], dst: [], extra: {} };

export default function AclRuleDialog({
  isOpen,
  setIsOpen,
  rule,
  sources,
  destinations,
  onSave,
}: AclRuleDialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<AclRule>(rule ?? EMPTY);

  useEffect(() => {
    if (isOpen) {
      setDraft(rule ? structuredClone(rule) : structuredClone(EMPTY));
    }
  }, [isOpen, rule]);

  const isInvalid = draft.src.length === 0 || draft.dst.length === 0;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={isInvalid}
        onSubmit={(event) => {
          event.preventDefault();
          // A hand-written policy may be missing the port spec Headscale wants.
          onSave({ ...draft, dst: draft.dst.map(withDefaultPort) });
          setIsOpen(false);
        }}
      >
        <Title>{rule ? t("acls.editAccessRule") : t("acls.newAccessRule")}</Title>
        <Text>
          {t("acls.accessRuleDesc")} <code className="font-mono">tag:web:80,443</code>.{" "}
          <code className="font-mono">:*</code> {t("acls.accessRuleDesc2")}{" "}
          <Link external styled to="https://tailscale.com/kb/1018/acls">
            {t("acls.tailscaleAclGuide")}
          </Link>{" "}
          {t("acls.fullSyntax")}
        </Text>
        <TokenList
          description={t("acls.sourcesDesc")}
          emptyText={t("acls.noSourcesYet")}
          label={t("acls.sources")}
          onChange={(src) => setDraft({ ...draft, src })}
          placeholder="group:eng"
          suggestions={sources}
          values={draft.src}
        />
        <TokenList
          description={t("acls.destinationsDesc")}
          emptyText={t("acls.noDestinationsYet")}
          label={t("acls.destinations")}
          normalize={withDefaultPort}
          onChange={(dst) => setDraft({ ...draft, dst })}
          placeholder="tag:web:80,443"
          suggestions={destinations}
          values={draft.dst}
        />
        <Input
          description={t("acls.protocolDesc")}
          label={t("acls.protocol")}
          onChange={(proto) => setDraft({ ...draft, proto: proto.length > 0 ? proto : undefined })}
          placeholder="tcp"
          value={draft.proto ?? ""}
        />
      </DialogPanel>
    </Dialog>
  );
}
