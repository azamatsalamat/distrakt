const blockedSites = ["*://*.youtube.com/*", "*://*.instagram.com/*"];

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    return { redirectUrl: chrome.runtime.getURL("block.html") };
  },
  { urls: blockedSites },
  ["blocking"]
);
