import { configMap, ignoreComponents } from "./baseConfig.js";
import { setPopupIcon } from "./icon.js";
import { sum } from "../utils/utils.js";

// Uses configMap to calculate a site's given score
export const siteValue = (site) => {
  let value = 0;

  for (const [score, siteSet] of Object.entries(configMap)) {
    const siteComponents = site.split(".");
    console.log;
    const setMatch = siteComponents.some((component) => {
      if (ignoreComponents.has(component)) {
        // ignore domain & extension components
        return false;
      } else {
        return siteSet["keys"].has(component); // check given siteSet for component match
      }
    });

    if (setMatch) {
      value = configMap[score]["value"];
      break;
    }
  }
  return value;
};

// Function to provide procrastination score and set Icon
export const calculateProductivity = () => {
  chrome.storage.local.get(["sites"], function (result) {
    const data = result.sites;
    const dataLength = data.length < 6 ? data.length : 6;

    //generate procrastination index
    const siteValues = Array.from({ length: dataLength }, (_, index) =>
      siteValue(data[index].name)
    );

    const procrastination = Math.max(
      0,
      Math.min(100, Math.floor(50 + sum(siteValues)))
    );

    setPopupIcon(procrastination);

    //set procrastination
    chrome.storage.local.set({ state: procrastination });
  });
};
