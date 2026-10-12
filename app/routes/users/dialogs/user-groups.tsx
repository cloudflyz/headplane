import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Text from "~/components/text";
import Title from "~/components/title";
import TokenList from "~/components/token-list";
import { isValidGroupName } from "~/utils/acl-policy";

interface UserGroupsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // The Headscale username, which is what the ACL policy references.
  userName: string;
  displayName: string;
  groups: string[];
  availableGroups: string[];
  // Whether the stored policy contains HuJSON comments, which saving drops.
  policyHasComments?: boolean;
}

export default function UserGroups({
  isOpen,
  setIsOpen,
  userName,
  displayName,
  groups,
  availableGroups,
  policyHasComments,
}: UserGroupsProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher<{ message?: string; error?: string }>();
  const submittingRef = useRef(false);
  const [selected, setSelected] = useState([...groups]);

  const error = fetcher.data?.error;
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (isOpen) {
      setSelected([...groups]);
    }
  }, [isOpen, groups]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      submittingRef.current = false;
      if (!fetcher.data.error) {
        setIsOpen(false);
      }
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && submittingRef.current) {
          return;
        }
        setIsOpen(open);
      }}
    >
      <DialogPanel
        isDisabled={isSubmitting}
        onSubmit={(event) => {
          event.preventDefault();
          submittingRef.current = true;
          const form = new FormData();
          form.set("action_id", "update_user_groups");
          form.set("user_name", userName);
          form.set("groups", selected.join(","));
          fetcher.submit(form, { method: "POST" });
        }}
      >
        <Title>{t("users.editAclGroups", { name: displayName })}</Title>
        <Text>
          {t("users.groupsLiveInAcl")}{" "}
          <code className="font-mono">groups</code>{" "}
          {t("users.sectionOfPolicy")}{" "}
          <Link external styled to="https://tailscale.com/kb/1018/acls">
            {t("acls.tailscaleAclGuide")}
          </Link>{" "}
          {t("users.forDetails")}
        </Text>
        {policyHasComments ? (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            {t("users.policyHasCommentsWarning")}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <TokenList
          emptyText={t("users.notInAnyGroup")}
          isDisabled={isSubmitting}
          label={t("acls.groups")}
          onChange={setSelected}
          placeholder="group:example"
          suggestions={availableGroups}
          validate={isValidGroupName}
          values={selected}
        />
      </DialogPanel>
    </Dialog>
  );
}
