import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import Card from "~/components/card";
import Link from "~/components/link";

export const sshErrors = {
  wasm_missing: {
    titleKey: "ssh.wasmMissingTitle",
    messageKey: "ssh.wasmMissingMsg",
    anchor: "#ssh-not-available",
  },

  agent_required: {
    titleKey: "ssh.agentRequiredTitle",
    messageKey: "ssh.agentRequiredMsg",
    anchor: "#agent-required",
  },

  oidc_required: {
    titleKey: "ssh.oidcRequiredTitle",
    messageKey: "ssh.oidcRequiredMsg",
    anchor: "#oidc-required",
  },

  node_not_found: (hostname: string) => ({
    titleKey: "ssh.nodeNotFoundTitle",
    messageKey: "ssh.nodeNotFoundMsg",
    messageParams: { hostname },
    anchor: "#node-not-found",
  }),

  user_not_linked: {
    titleKey: "ssh.userNotLinkedTitle",
    messageKey: "ssh.userNotLinkedMsg",
    anchor: "#user-not-linked",
  },
} as const;

interface SSHErrorBoundaryProps {
  titleKey: string;
  messageKey: string;
  messageParams?: Record<string, string>;
  anchor: string;
}

export function isSSHError(error: unknown): error is SSHErrorBoundaryProps {
  return (
    typeof error === "object" &&
    error !== null &&
    "titleKey" in error &&
    "messageKey" in error &&
    "anchor" in error &&
    typeof error.titleKey === "string" &&
    typeof error.messageKey === "string" &&
    typeof error.anchor === "string"
  );
}

const DOCS_BASE = "https://headplane.net/features/ssh";

export function SSHErrorBoundary({
  titleKey,
  messageKey,
  messageParams,
  anchor,
}: SSHErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <Card className="w-screen" variant="flat">
      <div className="flex items-center justify-between gap-4">
        <Card.Title>{t(titleKey)}</Card.Title>
        <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
      </div>
      <Card.Text>
        {t(messageKey, messageParams)}
        <br />
        <br />
        <Link to={`${DOCS_BASE}${anchor}`} external styled>
          {t("ssh.sshDocumentation")}
        </Link>{" "}
      </Card.Text>
    </Card>
  );
}
