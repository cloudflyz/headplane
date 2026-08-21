import { useTranslation } from "react-i18next";

import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Notice from "~/components/notice";
import RadioGroup from "~/components/radio-group";
import Text from "~/components/text";
import Title from "~/components/title";
import { Roles } from "~/server/web/roles";
import type { Role } from "~/server/web/roles";

interface ReassignProps {
  headplaneUserId: string;
  displayName: string;
  role: Role;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ReassignUser({
  headplaneUserId,
  displayName,
  role,
  isOpen,
  setIsOpen,
}: ReassignProps) {
  const { t } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant={role === "owner" ? "unactionable" : "normal"}>
        <Title>{t("users.changeRoleTitle", { name: displayName })}</Title>
        <Text className="mb-6">
          {t("users.changeRoleDesc")}{" "}
          <Link external styled to="https://tailscale.com/kb/1138/user-roles">
            {t("users.learnMore")}
          </Link>
        </Text>
        {role === "owner" ? (
          <Notice>{t("users.ownerCannotChange")}</Notice>
        ) : (
          <>
            <input name="action_id" type="hidden" value="reassign_user" />
            <input name="headplane_user_id" type="hidden" value={headplaneUserId} />
            <RadioGroup
              className="gap-4"
              defaultValue={role}
              label={t("users.role")}
              name="new_role"
            >
              {Object.keys(Roles)
                .filter((r) => r !== "owner")
                .map((r) => {
                  const { name, desc } = mapRoleToName(r, t);
                  return (
                    <RadioGroup.Radio key={r} label={name} value={r}>
                      <div className="block">
                        <p className="font-bold">{name}</p>
                        <p className="opacity-70">{desc}</p>
                      </div>
                    </RadioGroup.Radio>
                  );
                })}
            </RadioGroup>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}

function mapRoleToName(role: string, t: (key: string) => string) {
  switch (role) {
    case "admin":
      return {
        name: t("users.roles.admin"),
        desc: t("users.roles.adminDesc"),
      };
    case "network_admin":
      return {
        name: t("users.roles.networkAdmin"),
        desc: t("users.roles.networkAdminDesc"),
      };
    case "it_admin":
      return {
        name: t("users.roles.itAdmin"),
        desc: t("users.roles.itAdminDesc"),
      };
    case "auditor":
      return {
        name: t("users.roles.auditor"),
        desc: t("users.roles.auditorDesc"),
      };
    case "viewer":
      return {
        name: t("users.roles.viewer"),
        desc: t("users.roles.viewerDesc"),
      };
    case "member":
      return {
        name: t("users.roles.member"),
        desc: t("users.roles.memberDesc"),
      };
    default:
      return {
        name: role,
        desc: t("users.roles.noDesc"),
      };
  }
}
