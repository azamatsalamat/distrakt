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

function startAccessDelay() {
  const overlay = document.getElementById("overlay");
  const countdownEl = document.getElementById("countdown");

  let seconds = 10;
  countdownEl.textContent = seconds;

  const interval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      overlay.style.display = "none";
    }
  }, 1000);
}

if (typeof document !== "undefined") {
  window.addEventListener("DOMContentLoaded", startAccessDelay);

  document.getElementById("save").addEventListener("click", async () => {
    const text = document.getElementById("blocklist").value;
    const message = document.getElementById("customMessage").value;
    const domains = text
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d);
    await chrome.storage.local.set({
      blocklist: domains,
      blockMessage: message,
    });

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

  chrome.storage.local.get("blockMessage", (data) => {
    if (data.blockMessage) {
      document.getElementById("customMessage").value = data.blockMessage;
    }
  });
}
