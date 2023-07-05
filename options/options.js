let updateSites = [];
const placeholder =
  "https://reactnativecode.com/wp-content/uploads/2018/02/Default_Image_Thumbnail.png";

// Saves options to chrome.storage
const saveOptions = () => {
  updateSites.forEach((site) => {
    site.whitelist = document.getElementById(site.name).checked;
  });
  chrome.storage.local.set({ sites: updateSites });
  chrome.runtime.sendMessage({ type: "updateSites" });
  window.close();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const renderSites = () => {
  chrome.storage.local.get(["sites"], (result) => {
    const data = result.sites;
    updateSites = data;
    const sites = document.getElementById("sites");

    data.forEach((site) => {
      const icon = site.icon ? site.icon : placeholder
      const { name, whitelist } = site;
      sites.innerHTML += `<p><input type="checkbox" id="${name}" name="${name}" value="${name}" ${whitelist ? "checked" : ""}><img class="icon" style="padding-right: 8px;" src="${icon}">${name}</p>`;
    })
  });
}

document.addEventListener("DOMContentLoaded", renderSites);
document.getElementById("save").addEventListener("click", saveOptions);

//handle reset
document.getElementById("reset").addEventListener("click", () => {
  location.reload();
  chrome.runtime.sendMessage({ type: "resetSites" });
});
