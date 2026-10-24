#!/usr/bin/env python3
"""Verify en/zh locale parity and list machine-related keys."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOCALES = ROOT / "app" / "i18n" / "locales"

en = json.loads((LOCALES / "en" / "common.json").read_text(encoding="utf-8"))
zh = json.loads((LOCALES / "zh-CN" / "common.json").read_text(encoding="utf-8"))


def flatten(d, prefix=""):
    out = set()
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out |= flatten(v, key)
        else:
            out.add(key)
    return out


en_keys = flatten(en)
zh_keys = flatten(zh)

print("en keys:", len(en_keys), "| zh keys:", len(zh_keys))
print("In en not zh:", sorted(en_keys - zh_keys))
print("In zh not en:", sorted(zh_keys - en_keys))
print("PARITY OK" if en_keys == zh_keys else "PARITY FAIL")

# List machine-related key groups
for group in ("machines", "machine", "machineFilters"):
    if group in en:
        print(f"\n=== {group} ({len(en[group])} keys) ===")
        for k in sorted(en[group]):
            print(f"  {k}")
