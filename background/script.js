import { refreshSiteData } from "./tabs.js";
import { calculateProductivity } from "./procrastination.js";
import {
  onInstalledListener,
  tabActivationListener,
  tabUpdatedListener,
  messageListener,
} from "./listeners.js";

let sites = [];
let showRabbit = false;

// initialize
const initBackground = () => {
  chrome.storage.local.set({ showRabbit: false });
};

//Initialize Script
initBackground();

// Listeners
messageListener(sites, showRabbit);
tabActivationListener(sites);
tabUpdatedListener(sites);
onInstalledListener();

// Interval Functions
setInterval(() => refreshSiteData(sites), 1000 * 60 * 25);
setInterval(calculateProductivity, 1000 * 5);
