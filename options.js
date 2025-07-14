function buildRules(domains) {
  return domains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: `/block.html?origin=${encodeURIComponent(domain)}` },
    },
    condition: {
      urlFilter: domain.trim(),
      resourceTypes: ["main_frame"],
    },
  }));
}

if (typeof document !== "undefined") {
  document.getElementById("save").addEventListener("click", async () => {
    const text = document.getElementById("blocklist").value;
    const domains = text
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d);
    await chrome.storage.local.set({ blocklist: domains });

    const rules = buildRules(domains);
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = existing.map((r) => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: rules,
    });

    document.getElementById("status").textContent = "Blocklist updated!";
  });

  chrome.storage.local.get("blocklist", (data) => {
    if (data.blocklist) {
      document.getElementById("blocklist").value = data.blocklist.join("\n");
    }
  });
}
