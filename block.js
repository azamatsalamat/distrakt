document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("blockMessage", (data) => {
    const message = data.blockMessage?.trim();
    if (message) {
      document.getElementById("mainMessage").textContent = message;
    }
  });
});
