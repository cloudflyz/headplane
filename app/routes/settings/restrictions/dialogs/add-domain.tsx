import { type } from "arktype";
import { useTranslation } from "react-i18next";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";

const domainSchema = type({
  domain: "string > 0",
});

interface AddDomainProps {
  domains: string[];
  isDisabled?: boolean;
}

export default function AddDomain({ domains, isDisabled }: AddDomainProps) {
  const { t } = useTranslation();
  const form = useForm({
    schema: domainSchema,
    validate: (values) => {
      const domain = (values.domain as string).trim();
      if (domain.length === 0) return undefined;

      if (domains.includes(domain)) {
        return { domain: t("restrictions.domainExists") };
      }

      try {
        const url = new URL(`http://${domain}`);
        if (url.hostname !== domain) {
          return { domain: t("restrictions.invalidDomain") };
        }
      } catch {
        return { domain: t("restrictions.invalidDomain") };
      }

      return undefined;
    },
  });
  const domain = (form.values.domain as string).trim();

  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("restrictions.addDomain")}</Button>
      <DialogPanel>
        <Title>{t("restrictions.addDomain")}</Title>
        <Text className="mb-4">{t("restrictions.addDomainDesc")}</Text>
        <input name="action_id" type="hidden" value="add_domain" />
        <Input
          {...form.field("domain")}
          description={
            domain.length > 0
              ? t("restrictions.domainMatches", { domain })
              : t("restrictions.domainEnter")
          }
          required
          label={t("restrictions.domain")}
          placeholder="example.com"
        />
      </DialogPanel>
    </Dialog>
  );
}
