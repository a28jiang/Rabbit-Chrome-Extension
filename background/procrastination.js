import { configMap, ignoreComponents } from "./baseConfig.js";
import { setPopupIcon } from "./icon.js";
import { sum } from "../utils/utils.js";

// Uses configMap to calculate a site's given score
export const siteValue = (site) => {
  let value = 0;

  for (const type of Object.keys(configMap)) {
    const siteComponents = site.split(".");
    const setMatch = siteComponents.some((component) => {
      if (ignoreComponents.has(component)) {
        return false;
      }
      return configMap[type]["keys"].some((item) => item.includes(component)); // check given siteSet for component match
    });

    if (setMatch) {
      value = configMap[type]["value"];
      break;
    }
  }
  return value;
};

// Function to provide procrastination score and set Icon
export const calculateProductivity = () => {
  chrome.storage.local.get(["sites"], function (result) {
    const data = result.sites;
    const dataLength = Math.min(5, data.length);
    //generate procrastination index
    const siteValues = Array.from(
      { length: dataLength },
      (_, index) => siteValue(data[index].name) * (1.4 - 0.2 * index)
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
