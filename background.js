import { checkValidURL, getCurrentTab } from "./background/tabs.js";
import { calculateProductivity } from "./background/procrastination.js";

var sites = [];
var paused = false;

const setIcon = (procrastination) => {
  var mood = "chill";

  if (procrastination > 70) {
    mood = "happy";
  } else if (procrastination > 49) {
    mood = "chill";
  } else if (procrastination > 30) {
    mood = "meh";
  } else {
    mood = "cry";
  }

  var i = 0;
  //assemble gif for mood
  function iconLoop() {
    setTimeout(function timer() {
      chrome.action.setIcon({
        path: "./assets/" + mood + (i % 4) + ".png",
      });
      i++;
      if (i < 8) {
        iconLoop();
      }
    }, 300);
  }

  //call iconLoop
  iconLoop();
};

//refreshes cache every hour
var freshData = () => {
  sites = sites.slice(5);
  sites.forEach((site, index) => {
    site.count = 5 - index;
  });
  console.log("REFRESHED CACHE");

  chrome.storage.local.set({ sites: sites });
};

//initialize
var initBackground = () => {
  chrome.storage.local.set({ pauseState: false });
};

//reset, pause and update sites
chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == "resetSites") {
    console.log("reset!");
    sites = [];
    chrome.storage.local.set({ sites: sites });
    chrome.storage.local.set({ state: 50 });
  }
  if (request.type == "pauseSites") {
    paused = !paused;
    chrome.storage.local.set({ pauseState: paused });
  }
  if (request.type == "updateSites") {
    console.log("SITES UPDATED");
    chrome.storage.local.get(["sites"], function (result) {
      sites = result.sites;
    });
  }
});

//background scripts
initBackground();
setInterval(freshData, 1000 * 60 * 60);
setInterval(() => calculateProductivity(setIcon), 3000);

chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      const { url, favicon, status } = tabs[0];
      if (checkValidURL(tabs[0])) {
        const hostname = new URL(url).hostname;
        console.log("onActivated", hostname);
        getCurrentTab(hostname, favicon, sites);
      }
    }
  );
});

chrome.tabs.onUpdated.addListener(function (_, __, tab) {
  const { url, status } = tab;

  if (checkValidURL(tab)) {
    if (status == "complete") {
      const hostname = new URL(url).hostname;
      var favicon = tab.favIconUrl;

      console.log("onUpdated", hostname);
      getCurrentTab(hostname, favicon, sites);
    }
  }
});

//new user
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.tabs.create(
    { url: chrome.runtime.getURL("welcome.html") },
    function (tab) {
      console.log("New tab launched");
    }
  );
});
