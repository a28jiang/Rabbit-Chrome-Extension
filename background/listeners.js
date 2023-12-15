import { checkValidURL, updateSites } from "./tabs.js";

export const tabActivationListener = (sites) => {
  chrome.tabs.onActivated.addListener(function () {
    chrome.tabs.query(
      {
        currentWindow: true,
        active: true,
      },
      function (tabs) {
        const { url, favIconUrl } = tabs[0];
        if (checkValidURL(tabs[0])) {
          const hostname = new URL(url).hostname;
          updateSites(hostname, favIconUrl, sites);
        }
      }
    );
  });
};

export const tabUpdatedListener = (sites) => {
  chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    const { url, status } = tab;

    if (checkValidURL(tab)) {
      if (status == "complete" && changeInfo["status"] == "complete") {
        const hostname = new URL(url).hostname;
        updateSites(hostname, tab["favIconUrl"], sites);
      }
    }
  });
};

export const messageListener = (sites, showRabbit) => {
  //reset, showRabbit and update sites
  chrome.runtime.onMessage.addListener(function (request) {
    if (request.type == "resetSites") {
      sites = [];
      chrome.storage.local.set({ sites: sites });
      chrome.storage.local.set({ state: 50 });
    }
    if (request.type == "showRabbit") {
      showRabbit = !showRabbit;
      chrome.storage.local.set({ showRabbit: showRabbit });
    }
    if (request.type == "updateSites") {
      chrome.storage.local.get(["sites"], function (result) {
        sites = result.sites;
      });
    }
  });
};

export const onInstalledListener = () => {
  chrome.runtime.onInstalled.addListener(function (e) {
    if (e.reason === "install") {
      chrome.tabs.create(
        { url: chrome.runtime.getURL("tutorial/welcome.html") },
        function () {
          console.log("New tab launched");
        }
      );
    }
  });
};
