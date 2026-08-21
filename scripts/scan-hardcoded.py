#!/usr/bin/env python3
"""Scan machines dir for hardcoded English in JSX props."""
import re
import pathlib

root = pathlib.Path("/root/headplane/app/routes/machines")

patterns = [
    r'label="([A-Za-z][^"]*)"',
    r'placeholder="([A-Za-z][^"]*)"',
    r'aria-label="([A-Za-z][^"]*)"',
    r'description="([A-Za-z][^"]*)"',
    r'content="([A-Za-z][^"]*)"',
    r'text="([A-Za-z][^"]*)"',
    r'title="([A-Za-z][^"]*)"',
]

SKIP = {
    "action_id", "node_id", "user_id", "user", "name", "register_key", "q",
    "delete", "expire", "rename", "reassign", "update_routes", "update_tags",
    "toggle_expiry", "tag", "tags", "enabled", "disableExpiry", "routes",
    "POST", "register", "pre-auth", "submit", "text-left", "asc", "desc",
    "none", "ascending", "descending", "heavy", "light", "ghost", "danger",
    "normal", "destructive", "unactionable", "flat", "dark", "system", "end",
    "name", "ip", "version", "lastSeen", "online", "offline", "expired",
    "exit-node", "subnet", "tag-owned", "givenName", "hostname", "oldName",
}

print("=== Hardcoded English in JSX props ===")
found = False
for f in sorted(root.rglob("*.tsx")):
    text = f.read_text(encoding="utf-8")
    for i, line in enumerate(text.splitlines(), 1):
        for pat in patterns:
            for m in re.finditer(pat, line):
                val = m.group(1)
                if val in SKIP:
                    continue
                print(f"{f.relative_to(root)}:{i}: {pat.split('=')[0]}={val!r}")
                found = True
if not found:
    print("(none)")
