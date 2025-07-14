// Utility to build rules from domain list
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

// Handle saving from UI
if (typeof document !== "undefined") {
  document.getElementById("save").addEventListener("click", async () => {
    const text = document.getElementById("blocklist").value;
    const domains = text
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d);
    await chrome.storage.local.set({ blocklist: domains });

    const rules = buildRules(domains);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map((r) => r.id),
      addRules: rules,
    });

    document.getElementById("status").textContent = "Blocklist updated!";
  });

  // Load current blocklist
  chrome.storage.local.get("blocklist", (data) => {
    if (data.blocklist) {
      document.getElementById("blocklist").value = data.blocklist.join("\n");
    }
  });
}
