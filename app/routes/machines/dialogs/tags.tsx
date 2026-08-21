import { Plus, TagsIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Link from "~/components/link";
import TableList from "~/components/table-list";
import Text from "~/components/text";
import Title from "~/components/title";
import type { Machine } from "~/types";
import cn from "~/utils/cn";

interface TagsProps {
  machine: Machine;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingTags?: string[];
}

export default function Tags({ machine, isOpen, setIsOpen, existingTags }: TagsProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const submittingRef = useRef(false);
  const [tags, setTags] = useState([...machine.tags]);
  const [tag, setTag] = useState("tag:");
  const tagOptions = useMemo(
    () => (existingTags ?? []).filter((existingTag) => !tags.includes(existingTag)),
    [existingTags, tags],
  );
  const tagIsInvalid = useMemo(
    () => tag.length === 0 || !tag.startsWith("tag:") || tags.includes(tag),
    [tag, tags],
  );

  const error = fetcher.data && !fetcher.data.success ? fetcher.data.error : null;

  useEffect(() => {
    if (fetcher.data?.success) {
      submittingRef.current = false;
      setIsOpen(false);
    }

    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success) {
      submittingRef.current = false;
    }
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (isOpen) {
      setTags([...machine.tags]);
    }
  }, [isOpen]);

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
        onSubmit={(event) => {
          event.preventDefault();
          submittingRef.current = true;
          const form = new FormData();
          form.set("action_id", "update_tags");
          form.set("node_id", machine.id);
          form.set("tags", tags.filter((t) => t !== "").join(","));
          fetcher.submit(form, { method: "POST" });
        }}
        isDisabled={fetcher.state !== "idle"}
      >
        <Title>{t("machine.editAclTagsTitle", { name: machine.givenName })}</Title>
        <Text>
          <Trans
            i18nKey="machine.editAclTagsDesc"
            components={{
              link: (
                <Link external styled to="https://tailscale.com/kb/1068/acl-tags">
                  {t("machine.tailscaleDocs")}
                </Link>
              ),
            }}
          />
        </Text>
        {error ? (
          <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <TableList className="mt-4">
          {tags.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <TagsIcon />
              <p className="font-semibold">{t("machine.noTags")}</p>
            </TableList.Item>
          ) : (
            tags.map((item) => (
              <TableList.Item className="font-mono" id={item} key={item}>
                {item}
                <Button
                  className="rounded-md p-0.5"
                  onClick={() => {
                    setTags(tags.filter((tag) => tag !== item));
                  }}
                  type="button"
                >
                  <X className="p-1" />
                </Button>
              </TableList.Item>
            ))
          )}
        </TableList>

        <div className="mt-2 flex items-center gap-2">
          <Input
            aria-label={t("machine.addTag")}
            className="w-full"
            value={tag}
            onChange={setTag}
            invalid={tag.length > 0 && tagIsInvalid}
            placeholder={t("machine.tagPlaceholder")}
            label={t("machine.tag")}
            labelHidden
          />
          <Button
            className={cn("rounded-md p-1", tagIsInvalid && "opacity-50 cursor-not-allowed")}
            disabled={tagIsInvalid}
            onClick={() => {
              setTags([...tags, tag]);
              setTag("tag:");
            }}
            type="button"
          >
            <Plus className="p-1" size={30} />
          </Button>
        </div>
        {tagOptions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tagOptions.map((option) => (
              <Button
                className="px-2 py-1 font-mono text-xs"
                key={option}
                onClick={() => setTags([...tags, option])}
                type="button"
                variant="ghost"
              >
                {option}
              </Button>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-sm opacity-50">{t("machine.tagsNeedPolicy")}</p>
      </DialogPanel>
    </Dialog>
  );
}
