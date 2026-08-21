import { AlertCircle, Construction, Eye, FlaskConical, Pencil } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useFetcher, useRevalidator } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import Link from "~/components/link";
import Notice from "~/components/notice";
import PageError from "~/components/page-error";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~/components/tabs";
import { isApiError } from "~/server/headscale/api/error-client";
import toast from "~/utils/toast";

import type { Route } from "./+types/overview";
import { aclAction } from "./acl-action";
import { aclLoader } from "./acl-loader";
import Fallback from "./components/fallback";

const LazyEditor = lazy(() =>
  import("./components/cm.client").then((m) => ({ default: m.Editor })),
);
const LazyDiffer = lazy(() =>
  import("./components/cm.client").then((m) => ({ default: m.Differ })),
);

export const loader = aclLoader;
export const action = aclAction;

export default function Page({ loaderData: { access, writable, policy } }: Route.ComponentProps) {
  const { t } = useTranslation();
  const [codePolicy, setCodePolicy] = useState(policy);
  const fetcher = useFetcher<typeof action>();
  const { revalidate } = useRevalidator();
  const disabled = !access || !writable; // Disable if no permission or not writable

  useEffect(() => {
    // Update the codePolicy when the loader data changes
    if (policy !== codePolicy) {
      setCodePolicy(policy);
    }
  }, [policy]);

  useEffect(() => {
    if (!fetcher.data) {
      // No data yet, return
      return;
    }

    if (fetcher.data.success === true) {
      toast(t("acls.updatedPolicy"));
      revalidate();
    }
  }, [fetcher.data]);

  return (
    <div>
      {!access ? (
        <Notice title={t("acls.restrictedTitle")} variant="warning">
          {t("acls.restrictedDesc")}
        </Notice>
      ) : !writable ? (
        <Notice title={t("acls.readOnlyTitle")} variant="error">
          {t("acls.readOnlyDesc")}
        </Notice>
      ) : undefined}
      <h1 className="mb-4 text-2xl font-medium">{t("acls.title")}</h1>
      <p className="mb-4 max-w-prose">
        {t("acls.description")}{" "}
        <Link external styled to="https://tailscale.com/kb/1018/acls">
          {t("acls.tailscaleGuide")}
        </Link>{" "}
        {t("acls.and")}{" "}
        <Link external styled to="https://headscale.net/stable/ref/acls/">
          {t("acls.headscaleDocs")}
        </Link>
        .
      </p>
      {fetcher.data?.error !== undefined ? (
        <Notice title={fetcher.data.error.split(":")[0] ?? t("common.error")} variant="error">
          {fetcher.data.error.split(":").slice(1).join(": ") ?? t("acls.updateError")}
        </Notice>
      ) : undefined}
      <Tabs className="mb-4" label={t("acls.editor")} defaultValue="edit">
        <TabsList>
          <TabsTab value="edit">
            <div className="flex items-center gap-2">
              <Pencil className="p-1" />
              <span>{t("acls.editFile")}</span>
            </div>
          </TabsTab>
          <TabsTab value="diff">
            <div className="flex items-center gap-2">
              <Eye className="p-1" />
              <span>{t("acls.previewChanges")}</span>
            </div>
          </TabsTab>
          <TabsTab value="preview">
            <div className="flex items-center gap-2">
              <FlaskConical className="p-1" />
              <span>{t("acls.previewRules")}</span>
            </div>
          </TabsTab>
        </TabsList>
        <TabsPanel value="edit">
          <Suspense fallback={<Fallback />}>
            <LazyEditor isDisabled={disabled} onChange={setCodePolicy} value={codePolicy} />
          </Suspense>
        </TabsPanel>
        <TabsPanel value="diff">
          <Suspense fallback={<Fallback />}>
            <LazyDiffer left={policy} right={codePolicy} />
          </Suspense>
        </TabsPanel>
        <TabsPanel value="preview">
          <div className="flex flex-col items-center py-8">
            <Construction />
            <p className="mt-4 w-1/2 text-center">{t("acls.previewUnavailable")}</p>
          </div>
        </TabsPanel>
      </Tabs>
      <Button
        className="mr-2"
        disabled={
          disabled || fetcher.state !== "idle" || codePolicy.length === 0 || codePolicy === policy
        }
        onClick={() => {
          const formData = new FormData();
          formData.append("policy", codePolicy);
          fetcher.submit(formData, { method: "PATCH" });
        }}
        variant="heavy"
      >
        {t("common.save")}
      </Button>
      <Button
        disabled={disabled || fetcher.state !== "idle" || codePolicy === policy}
        onClick={() => {
          // Reset the editor to the original policy
          setCodePolicy(policy);
        }}
      >
        {t("acls.discardChanges")}
      </Button>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  if (
    isRouteErrorResponse(error) &&
    isApiError(error.data) &&
    error.data.rawData.includes("reading policy from path") &&
    error.data.rawData.includes("no such file or directory")
  ) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="max-w-2xl" variant="flat">
          <div className="flex items-center justify-between gap-4">
            <Card.Title>{t("acls.policyUnavailableTitle")}</Card.Title>
            <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
          </div>
          <Card.Text>{t("acls.policyUnavailableDesc")}</Card.Text>
        </Card>
        <Card className="max-w-2xl" variant="flat">
          <Card.Text>{t("acls.policyUnavailableActions")}</Card.Text>
          <ul className="mt-2 ml-4 list-outside list-disc space-y-1 text-sm">
            <li>{t("acls.policyUnavailableAction1")}</li>
            <li>{t("acls.policyUnavailableAction2")}</li>
          </ul>
        </Card>
      </div>
    );
  }

  return <PageError error={error} page={t("acls.title")} />;
}
