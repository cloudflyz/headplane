#!/usr/bin/env python3
"""Merge machine i18n keys into en and zh-CN locale files."""
import json

MACHINES_ADD = {
    "searchMachines": ("Search machines", "搜索设备"),
    "sortByName": ("Sort by name", "按名称排序"),
    "sortByIp": ("Sort by IP address", "按 IP 地址排序"),
    "sortByVersion": ("Sort by version", "按版本排序"),
    "sortByLastSeen": ("Sort by last seen", "按最后在线排序"),
    "magicDnsInfo": (
        "Since MagicDNS is enabled, you can access devices based on their name and also at <code>{{dns}}</code>.",
        "由于已启用 MagicDNS，您可以根据设备名称访问设备，也可以访问 <code>{{dns}}</code>。",
    ),
    "allMachines": ("All Machines", "所有设备"),
    "tagOwned": ("Tag-owned", "标签拥有"),
    "ipCopied": ("Copied IP address to clipboard", "已复制 IP 地址到剪贴板"),
    "registerKeyError": (
        "Paste the registration URL or full hskey-authreq-... key from tailscale up.",
        "请粘贴 tailscale up 显示的注册链接或完整的 hskey-authreq-... 密钥。",
    ),
}

MACHINE_ADD = {
    "machineSettings": ("Machine Settings", "设备设置"),
    "editMachineName": ("Edit machine name", "编辑设备名称"),
    "enableKeyExpiry": ("Enable key expiry", "启用密钥过期"),
    "disableKeyExpiry": ("Disable key expiry", "禁用密钥过期"),
    "editRouteSettings": ("Edit route settings", "编辑路由设置"),
    "editAclTags": ("Edit ACL tags", "编辑 ACL 标签"),
    "changeOwner": ("Change owner", "更改所有者"),
    "changeOwnerTitle": ("Change the owner of {{name}}", "更改 {{name}} 的所有者"),
    "changeOwnerDesc": ("The owner of the machine is the user associated with it.", "设备的所有者是与其关联的用户。"),
    "expireMachine": ("Expire", "使过期"),
    "removeMachine": ("Remove", "移除"),
    "editAclTagsTitle": ("Edit ACL tags for {{name}}", "编辑 {{name}} 的 ACL 标签"),
    "editAclTagsDesc": (
        "ACL tags can be used to reference machines in your ACL policies. See the <link>Tailscale documentation</link> for more information.",
        "ACL 标签可用于在您的 ACL 策略中引用设备。有关更多信息，请参阅<link>Tailscale 文档</link>。",
    ),
    "noTags": ("No tags are set on this machine", "此设备未设置标签"),
    "addTag": ("Add a tag", "添加标签"),
    "tagPlaceholder": ("tag:example", "tag:example"),
    "tag": ("Tag", "标签"),
    "tagsNeedPolicy": (
        "Not seeing the tags you expect? Tags need to be defined in your access control policy before they can be assigned to machines.",
        "没有看到您预期的标签？标签需要先在您的访问控制策略中定义，然后才能分配给设备。",
    ),
    "editRoutesTitle": ("Edit route settings of {{name}}", "编辑 {{name}} 的路由设置"),
    "subnetRoutes": ("Subnet routes", "子网路由"),
    "subnetRoutesDesc": (
        "Connect to devices you can't install Tailscale on by advertising IP ranges as subnet routes. <link>Learn More</link>",
        "通过将 IP 范围作为子网路由广播，连接无法安装 Tailscale 的设备。<link>了解更多</link>",
    ),
    "noRoutesAdvertised": ("No routes are advertised by this machine", "此设备未广播任何路由"),
    "exitNodes": ("Exit nodes", "出口节点"),
    "exitNodesDesc": (
        "Allow your network to route internet traffic through this machine. <link>Learn More</link>",
        "允许您的网络通过此设备路由互联网流量。<link>了解更多</link>",
    ),
    "notExitNode": ("This machine is not an exit node", "此设备不是出口节点"),
    "useAsExitNode": ("Use as exit node", "用作出口节点"),
    "managedBy": ("Managed by", "管理者"),
    "managedByTooltip": ("By default, a machine's permissions match its creator's.", "默认情况下，设备的权限与其创建者一致。"),
    "status": ("Status", "状态"),
    "subnetsRouting": ("Subnets & Routing", "子网与路由"),
    "subnetsDesc": (
        "Subnets let you expose physical network routes onto Tailscale. <link>Learn More</link>",
        "子网允许您将物理网络路由暴露到 Tailscale 上。<link>了解更多</link>",
    ),
    "review": ("Review", "查看"),
    "approved": ("Approved", "已批准"),
    "approvedTooltip": ("Traffic to these routes are being routed through this machine.", "发往这些路由的流量正通过此设备路由。"),
    "awaitingApproval": ("Awaiting Approval", "等待批准"),
    "awaitingApprovalTooltip": (
        "This machine is advertising these routes, but they must be approved before traffic will be routed to them.",
        "此设备正在广播这些路由，但在流量路由到它们之前必须先获得批准。",
    ),
    "exitNode": ("Exit Node", "出口节点"),
    "exitNodeTooltip": ("Whether this machine can act as an exit node for your tailnet.", "此设备是否可以作为您 tailnet 的出口节点。"),
    "allowed": ("Allowed", "已允许"),
    "edit": ("Edit", "编辑"),
    "machineDetails": ("Machine Details", "设备详情"),
    "machineDetailsDesc": ("Information about this machine's network. Used to debug connection issues.", "关于此设备网络的信息。用于排查连接问题。"),
    "creator": ("Creator", "创建者"),
    "osHostname": ("OS hostname", "系统主机名"),
    "osHostnameTooltip": (
        "OS hostname is published by the machine's operating system and is used as the default name for the machine.",
        "系统主机名由设备的操作系统发布，用作设备的默认名称。",
    ),
    "os": ("OS", "操作系统"),
    "tailscaleVersion": ("Tailscale version", "Tailscale 版本"),
    "id": ("ID", "ID"),
    "idTooltip": ("ID for this machine. Used in the Headscale API.", "此设备的 ID。用于 Headscale API。"),
    "nodeKey": ("Node key", "节点密钥"),
    "nodeKeyTooltip": ("Public key which uniquely identifies this machine.", "唯一标识此设备的公钥。"),
    "created": ("Created", "创建时间"),
    "keyExpiry": ("Key expiry", "密钥过期时间"),
    "domain": ("Domain", "域名"),
    "tailscaleIpv4": ("Tailscale IPv4", "Tailscale IPv4"),
    "tailscaleIpv4Tooltip": (
        "This machine's IPv4 address within your tailnet (your private Tailscale network).",
        "此设备在您的 tailnet（您的私有 Tailscale 网络）中的 IPv4 地址。",
    ),
    "tailscaleIpv6": ("Tailscale IPv6", "Tailscale IPv6"),
    "tailscaleIpv6Tooltip": (
        "This machine's IPv6 address within your tailnet (your private Tailscale network). Connections within your tailnet support IPv6 even if your ISP does not.",
        "此设备在您的 tailnet（您的私有 Tailscale 网络）中的 IPv6 地址。即使您的 ISP 不支持，tailnet 内的连接也支持 IPv6。",
    ),
    "shortDomain": ("Short domain", "短域名"),
    "shortDomainTooltip": ("Users of your tailnet can use this DNS short name to access this machine.", "您 tailnet 的用户可以使用此 DNS 短名称访问此设备。"),
    "fullDomain": ("Full domain", "完整域名"),
    "fullDomainTooltip": ("Users of your tailnet can use this DNS name to access this machine.", "您 tailnet 的用户可以使用此 DNS 名称访问此设备。"),
    "endpoints": ("Endpoints", "端点"),
    "clientConnectivity": ("Client Connectivity", "客户端连接"),
    "varies": ("Varies", "变化"),
    "variesTooltip": (
        "Whether the machine is behind a difficult NAT that varies the machine's IP address depending on the destination.",
        "设备是否位于一个困难的 NAT 后面，该 NAT 会根据目标地址变化设备的 IP 地址。",
    ),
    "hairpinning": ("Hairpinning", "Hairpinning"),
    "hairpinningTooltip": ("Whether the machine needs to traverse NATs with hairpinning.", "设备是否需要使用 hairpinning 穿越 NAT。"),
    "yes": ("Yes", "是"),
    "no": ("No", "否"),
}

MACHINE_FILTERS_ADD = {
    "user": ("User", "用户"),
    "tag": ("Tag", "标签"),
    "status": ("Status", "状态"),
    "route": ("Route", "路由"),
    "tagOwned": ("Tag-owned", "标签拥有"),
    "exitNode": ("Exit node", "出口节点"),
    "subnetRouter": ("Subnet router", "子网路由器"),
    "clearFilter": ("Clear filter", "清除筛选"),
    "clearFilters": ("Clear filters", "清除筛选"),
}

FILES = [
    ("/root/headplane/app/i18n/locales/en/common.json", 0),
    ("/root/headplane/app/i18n/locales/zh-CN/common.json", 1),
]

for path, locale in FILES:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    machines = data.setdefault("machines", {})
    for k, (en, zh) in MACHINES_ADD.items():
        machines.setdefault(k, (en, zh)[locale])

    machine = data.setdefault("machine", {})
    for k, (en, zh) in MACHINE_ADD.items():
        machine.setdefault(k, (en, zh)[locale])

    mf = data.setdefault("machineFilters", {})
    for k, (en, zh) in MACHINE_FILTERS_ADD.items():
        mf.setdefault(k, (en, zh)[locale])

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("updated", path, "| machines:", len(machines), "machine:", len(machine), "machineFilters:", len(mf))
