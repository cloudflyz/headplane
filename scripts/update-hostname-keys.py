#!/usr/bin/env python3
"""Update hostnameInfo/hostnameCurrent keys to use Trans <0>/<1> placeholders."""
import json

ENTRIES = [
    (
        "/root/headplane/app/i18n/locales/en/common.json",
        "This machine will be accessible by the hostname <0>{{hostname}}</0>. The hostname <1>{{oldName}}</1> will no longer point to this machine.",
        "This machine is accessible by the hostname <0>{{hostname}}</0>.",
    ),
    (
        "/root/headplane/app/i18n/locales/zh-CN/common.json",
        "此设备将可通过主机名 <0>{{hostname}}</0> 访问。主机名 <1>{{oldName}}</1> 将不再指向此设备。",
        "此设备可通过主机名 <0>{{hostname}}</0> 访问。",
    ),
]

for path, info_text, current_text in ENTRIES:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    data["machine"]["hostnameInfo"] = info_text
    data["machine"]["hostnameCurrent"] = current_text
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("updated", path)
