import { GlobeLock, RouteOff } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Switch from "~/components/switch";
import TableList from "~/components/table-list";
import Text from "~/components/text";
import Title from "~/components/title";
import { PopulatedNode } from "~/utils/node-info";

interface RoutesProps {
  node: PopulatedNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// TODO: Support deleting routes
export default function Routes({ node, isOpen, setIsOpen }: RoutesProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();

  const subnets = [
    ...node.customRouting.subnetApprovedRoutes,
    ...node.customRouting.subnetWaitingRoutes,
  ];

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="unactionable">
        <Title>{t("machine.editRoutesTitle", { name: node.givenName })}</Title>
        <Text className="font-bold">{t("machine.subnetRoutes")}</Text>
        <Text>
          <Trans
            i18nKey="machine.subnetRoutesDesc"
            components={{
              link: (
                <Link external styled to="https://tailscale.com/kb/1019/subnets">
                  {t("machines.learnMore")}
                </Link>
              ),
            }}
          />
        </Text>
        <TableList className="mt-4">
          {subnets.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <RouteOff />
              <p className="font-semibold">{t("machine.noRoutesAdvertised")}</p>
            </TableList.Item>
          ) : undefined}
          {subnets.map((route) => (
            <TableList.Item key={route}>
              <p>{route}</p>
              <Switch
                defaultChecked={node.approvedRoutes.includes(route)}
                label={t("common.enabled")}
                onCheckedChange={(checked) => {
                  const form = new FormData();
                  form.set("action_id", "update_routes");
                  form.set("node_id", node.id);
                  form.set("routes", [route].join(","));

                  form.set("enabled", String(checked));
                  fetcher.submit(form, {
                    method: "POST",
                  });
                }}
              />
            </TableList.Item>
          ))}
        </TableList>
        <Text className="mt-8 font-bold">{t("machine.exitNodes")}</Text>
        <Text>
          <Trans
            i18nKey="machine.exitNodesDesc"
            components={{
              link: (
                <Link external styled to="https://tailscale.com/kb/1103/exit-nodes">
                  {t("machines.learnMore")}
                </Link>
              ),
            }}
          />
        </Text>
        <TableList className="mt-4">
          {node.customRouting.exitRoutes.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <GlobeLock />
              <p className="font-semibold">{t("machine.notExitNode")}</p>
            </TableList.Item>
          ) : (
            <TableList.Item>
              <p>{t("machine.useAsExitNode")}</p>
              <Switch
                defaultChecked={node.customRouting.exitApproved}
                label={t("common.enabled")}
                onCheckedChange={(checked) => {
                  const form = new FormData();
                  form.set("action_id", "update_routes");
                  form.set("node_id", node.id);
                  form.set("routes", node.customRouting.exitRoutes.map((route) => route).join(","));

                  form.set("enabled", String(checked));
                  fetcher.submit(form, {
                    method: "POST",
                  });
                }}
              />
            </TableList.Item>
          )}
        </TableList>
      </DialogPanel>
    </Dialog>
  );
}
