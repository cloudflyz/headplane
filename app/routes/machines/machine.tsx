import { CheckCircle, CircleSlash, Info, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { data } from "react-router";

import Attribute from "~/components/attribute";
import Button from "~/components/button";
import Card from "~/components/card";
import Chip from "~/components/chip";
import Link from "~/components/link";
import StatusCircle from "~/components/status-circle";
import Tooltip from "~/components/tooltip";
import {
  agentsContext,
  authContext,
  headscaleConfigContext,
  headscaleContext,
  headscaleLiveStoreContext,
  requestApiContext,
} from "~/server/context";
import { nodesResource, usersResource } from "~/server/headscale/live-store";
import { Capabilities } from "~/server/web/roles";
import cn from "~/utils/cn";
import { getOSInfo, getTSVersion } from "~/utils/host-info";
import { extractTagOwnerTags, isNoExpiry, mapNodes, sortAssignableTags } from "~/utils/node-info";
import { getUserDisplayName } from "~/utils/user";

import type { Route } from "./+types/machine";
import { mapTagsToComponents, uiTagsForNode } from "./components/machine-row";
import MenuOptions from "./components/menu";
import Routes from "./dialogs/routes";
import { machineAction } from "./machine-actions";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const agentsFeature = context.get(agentsContext);
  const auth = context.get(authContext);
  const getRequestApi = context.get(requestApiContext);
  const headscale = context.get(headscaleContext);
  const headscaleConfig = context.get(headscaleConfigContext);
  const headscaleLiveStore = context.get(headscaleLiveStoreContext);

  if (!params.id) {
    throw new Error("No machine ID provided");
  }

  if (params.id.endsWith(".ico")) {
    throw data(null, { status: 204 });
  }

  const principal = await auth.require(request);

  if (!auth.can(principal, Capabilities.read_machines)) {
    throw new Error(
      "You do not have permission to view this page. Please contact your administrator.",
    );
  }

  const magic = headscaleConfig.getMagicDNSBaseDomain();

  const { api } = await getRequestApi(request);
  const [nodesSnap, usersSnap] = await Promise.all([
    headscaleLiveStore.get(nodesResource, api),
    headscaleLiveStore.get(usersResource, api),
  ]);
  const nodes = nodesSnap.data;
  const users = usersSnap.data;
  const node = nodes.find((node) => node.id === params.id);
  if (node == null) {
    throw data(null, { status: 404 });
  }

  const agents = agentsFeature.state === "enabled" ? agentsFeature.value : undefined;
  const [lookup, policyResult] = await Promise.allSettled([
    agents?.lookup([node.nodeKey]),
    api.policy.get(),
  ]);
  const stats = lookup.status === "fulfilled" ? lookup.value : undefined;
  const [enhancedNode] = mapNodes([node], stats);
  const tags = [...node.tags].toSorted();
  const supportsNodeOwnerChange = !headscale.capabilities.nodeOwnerIsImmutable;
  const supportsDisablingKeyExpiry = headscale.capabilities.keyExpiryCanBeDisabled;
  const agentSync = agents?.lastSync();
  const policy = policyResult.status === "fulfilled" ? policyResult.value.policy : undefined;

  return {
    agent: agentSync
      ? {
          syncedAt: agentSync.syncedAt?.toISOString() ?? null,
          nodeCount: agentSync.nodeCount,
          nodeKey: agents?.agentNodeKey(),
        }
      : undefined,
    existingTags: sortAssignableTags(nodes, policy),
    // `undefined` keeps the tag dialog from flagging every tag as undeclared.
    policyTags: extractTagOwnerTags(policy),
    magic,
    node: enhancedNode,
    stats: stats?.[enhancedNode.nodeKey],
    supportsNodeOwnerChange: supportsNodeOwnerChange,
    supportsDisablingKeyExpiry: supportsDisablingKeyExpiry,
    tags,
    users,
  };
}

export const action = machineAction;

export default function Page({
  loaderData: {
    node,
    tags,
    users,
    magic,
    agent,
    stats,
    existingTags,
    policyTags,
    supportsNodeOwnerChange,
    supportsDisablingKeyExpiry,
  },
}: Route.ComponentProps) {
  const { t } = useTranslation();
  const [showRouting, setShowRouting] = useState(false);

  const uiTags = useMemo(() => {
    const tags = uiTagsForNode(node, agent?.nodeKey === node.nodeKey);
    return tags;
  }, [node, agent]);

  return (
    <div>
      <p className="text-md mb-8">
        <Link className="font-medium" to="/machines">
          {t("machines.allMachines")}
        </Link>
        <span className="mx-2">/</span>
        {node.givenName}
      </p>
      <div
        className={cn(
          "flex justify-between items-center pb-2",
          "border-b border-mist-100 dark:border-mist-800",
        )}
      >
        <span className="flex items-baseline gap-x-4 text-sm">
          <h1 className="text-2xl font-medium">{node.givenName}</h1>
          <StatusCircle className="h-4 w-4" isOnline={node.online} />
        </span>
        <MenuOptions
          existingTags={existingTags}
          policyTags={policyTags}
          isFullButton
          magic={magic}
          node={node}
          users={users}
          supportsNodeOwnerChange={supportsNodeOwnerChange}
          supportsDisablingKeyExpiry={supportsDisablingKeyExpiry}
        />
      </div>
      <div className="mb-4 flex gap-1">
        <div className="border-r border-mist-100 p-2 pr-4 dark:border-mist-800">
          <span className="flex items-center gap-x-1 text-sm text-mist-600 dark:text-mist-300">
            {t("machine.managedBy")}
            <Tooltip content={t("machine.managedByTooltip")}>
              <Info className="p-1" />
            </Tooltip>
          </span>
          <div className="mt-1 flex items-center gap-x-2.5">
            <UserCircle />
            {node.user ? getUserDisplayName(node.user) : t("machines.tagOwned")}
          </div>
        </div>
        <div className="p-2 pl-4">
          <p className="text-sm text-mist-600 dark:text-mist-300">{t("machine.status")}</p>
          <div className="mt-1 mb-8 flex gap-1">
            {mapTagsToComponents(node, uiTags)}
            {tags.map((tag) => (
              <Chip key={tag} text={tag} />
            ))}
          </div>
        </div>
      </div>
      <Routes isOpen={showRouting} node={node} setIsOpen={setShowRouting} />
      <h2 className="mt-8 text-xl font-medium">{t("machine.subnetsRouting")}</h2>
      <div className="mb-4 flex items-center justify-between">
        <p>
          <Trans
            i18nKey="machine.subnetsDesc"
            components={{
              link: (
                <Link external styled to="https://tailscale.com/kb/1019/subnets">
                  {t("machines.learnMore")}
                </Link>
              ),
            }}
          />
        </p>
        <Button onClick={() => setShowRouting(true)}>{t("machine.review")}</Button>
      </div>
      <Card
        className={cn(
          "w-full max-w-full grid sm:grid-cols-2",
          "md:grid-cols-4 gap-8 mr-2 text-sm mb-8",
        )}
        variant="flat"
      >
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            {t("machine.approved")}
            <Tooltip content={t("machine.approvedTooltip")}>
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.subnetApprovedRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : (
              <ul className="leading-normal">
                {node.customRouting.subnetApprovedRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            {t("machine.edit")}
          </Button>
        </div>
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            {t("machine.awaitingApproval")}
            <Tooltip content={t("machine.awaitingApprovalTooltip")}>
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.subnetWaitingRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : (
              <ul className="leading-normal">
                {node.customRouting.subnetWaitingRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            {t("machine.edit")}
          </Button>
        </div>
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            {t("machine.exitNode")}
            <Tooltip content={t("machine.exitNodeTooltip")}>
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.exitRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : node.customRouting.exitApproved ? (
              <span className="flex items-center gap-x-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                {t("machine.allowed")}
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                <CircleSlash className="h-3.5 w-3.5 text-red-700" />
                {t("machine.awaitingApproval")}
              </span>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            {t("machine.edit")}
          </Button>
        </div>
      </Card>
      <h2 className="text-xl font-medium">{t("machine.machineDetails")}</h2>
      <p className="mb-4">{t("machine.machineDetailsDesc")}</p>
      <Card
        className="grid w-full max-w-full grid-cols-1 gap-y-2 sm:gap-x-12 lg:grid-cols-2"
        variant="flat"
      >
        <div className="flex flex-col gap-1">
          <Attribute
            name={t("machine.creator")}
            value={node.user ? getUserDisplayName(node.user) : t("machines.tagOwned")}
          />
          <Attribute name={t("machine.machineName")} value={node.givenName} />
          <Attribute
            name={t("machine.osHostname")}
            tooltip={t("machine.osHostnameTooltip")}
            value={node.name}
          />
          {stats ? (
            <>
              <Attribute name={t("machine.os")} value={getOSInfo(stats)} />
              <Attribute name={t("machine.tailscaleVersion")} value={getTSVersion(stats)} />
            </>
          ) : undefined}
          <Attribute name={t("machine.id")} tooltip={t("machine.idTooltip")} value={node.id} />
          <Attribute
            isCopyable
            name={t("machine.nodeKey")}
            tooltip={t("machine.nodeKeyTooltip")}
            value={node.nodeKey}
          />
          <Attribute
            name={t("machine.created")}
            value={new Date(node.createdAt).toLocaleString()}
          />
          <Attribute
            name={t("machine.lastSeen")}
            value={node.online ? t("common.connected") : new Date(node.lastSeen).toLocaleString()}
          />
          <Attribute
            name={t("machine.keyExpiry")}
            value={
              !isNoExpiry(node.expiry) ? new Date(node.expiry!).toLocaleString() : t("common.never")
            }
          />
          {magic ? (
            <Attribute isCopyable name={t("machine.domain")} value={`${node.givenName}.${magic}`} />
          ) : undefined}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-mist-600 uppercase dark:text-mist-300">
            {t("machines.addresses")}
          </p>
          <Attribute
            isCopyable
            name={t("machine.tailscaleIpv4")}
            tooltip={t("machine.tailscaleIpv4Tooltip")}
            value={getIpv4Address(node.ipAddresses)}
          />
          <Attribute
            isCopyable
            name={t("machine.tailscaleIpv6")}
            tooltip={t("machine.tailscaleIpv6Tooltip")}
            value={getIpv6Address(node.ipAddresses)}
          />
          <Attribute
            isCopyable
            name={t("machine.shortDomain")}
            tooltip={t("machine.shortDomainTooltip")}
            value={node.givenName}
          />
          {magic ? (
            <Attribute
              isCopyable
              name={t("machine.fullDomain")}
              tooltip={t("machine.fullDomainTooltip")}
              value={`${node.givenName}.${magic}`}
            />
          ) : undefined}
          {stats?.Endpoints ? (
            <Attribute name={t("machine.endpoints")} value={stats?.Endpoints?.join("\n") ?? "—"} />
          ) : undefined}
          {stats ? (
            <>
              <p className="mt-4 text-sm font-semibold text-mist-600 uppercase dark:text-mist-300">
                {t("machine.clientConnectivity")}
              </p>
              <Attribute
                name={t("machine.varies")}
                tooltip={t("machine.variesTooltip")}
                value={stats.NetInfo?.MappingVariesByDestIP ? t("machine.yes") : t("machine.no")}
              />
              <Attribute
                name={t("machine.hairpinning")}
                tooltip={t("machine.hairpinningTooltip")}
                value={stats.NetInfo?.HairPinning ? t("machine.yes") : t("machine.no")}
              />
              <Attribute
                name={t("machine.ipv6")}
                value={stats.NetInfo?.WorkingIPv6 ? t("machine.yes") : t("machine.no")}
              />
              <Attribute
                name={t("machine.udp")}
                value={stats.NetInfo?.WorkingUDP ? t("machine.yes") : t("machine.no")}
              />
              <Attribute
                name={t("machine.upnp")}
                value={stats.NetInfo?.UPnP ? t("machine.yes") : t("machine.no")}
              />
              <Attribute
                name={t("machine.pcp")}
                value={stats.NetInfo?.PCP ? t("machine.yes") : t("machine.no")}
              />
              <Attribute
                name={t("machine.natPmp")}
                value={stats.NetInfo?.PMP ? t("machine.yes") : t("machine.no")}
              />
            </>
          ) : undefined}
        </div>
      </Card>
    </div>
  );
}

function getIpv4Address(addresses: string[]) {
  for (const address of addresses) {
    if (address.startsWith("100.")) {
      // Return the first CGNAT address
      return address;
    }
  }

  return "—";
}

function getIpv6Address(addresses: string[]) {
  for (const address of addresses) {
    if (address.startsWith("fd")) {
      // Return the first IPv6 address
      return address;
    }
  }

  return "—";
}
