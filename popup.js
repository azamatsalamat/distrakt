document.addEventListener("DOMContentLoaded", async () => {
  const domainEl = document.getElementById("domain");
  const statusEl = document.getElementById("status");
  const blockBtn = document.getElementById("blockBtn");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) throw new Error("No active tab URL");

    const url = new URL(tab.url);
    let domain = url.hostname.replace(/^www\./, "");
    if (url.origin === "chrome-extension://ihoibnmekgnndmelmiglaejfldjhkmcf" && url.pathname === "/block.html") {
      domain = url.searchParams.get("origin");
    }

    domainEl.textContent = domain;

    chrome.storage.local.get("blocklist", async (data) => {
      const blocklist = data.blocklist || [];
      const isBlocked = blocklist.includes(domain);

      if (isBlocked) {
        statusEl.textContent = "✅ Blocked";
        statusEl.className = "status blocked";
      } else {
        statusEl.textContent = "❌ Not Blocked";
        statusEl.className = "status not-blocked";
        blockBtn.style.display = "block";

        blockBtn.addEventListener("click", async () => {
          const updated = [...blocklist, domain];
          await chrome.storage.local.set({ blocklist: updated });

          const rules = updated.map((d, i) => ({
            id: i + 1,
            priority: 1,
            action: {
              type: "redirect",
              redirect: {
                extensionPath: `/block.html?origin=${encodeURIComponent(d)}`,
              },
            },
            condition: {
              urlFilter: d,
              resourceTypes: ["main_frame"],
            },
          }));

          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map((r) => r.id),
            addRules: rules,
          });

          blockBtn.style.display = "none";
          statusEl.textContent = "✅ Blocked";
          statusEl.className = "status blocked";

          chrome.tabs.reload(tab.id);
        });
      }
    });
  } catch (e) {
    domainEl.textContent = "(error)";
    statusEl.textContent = "Failed to load tab.";
    console.error("Popup error:", e);
  }
});
