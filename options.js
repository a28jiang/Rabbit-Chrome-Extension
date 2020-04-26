var updateSites = [];
const placeholder =
  "https://reactnativecode.com/wp-content/uploads/2018/02/Default_Image_Thumbnail.png";

// Saves options to chrome.storage
function save_options() {
  updateSites.forEach((site) => {
    site.whitelist = document.getElementById(site.name).checked;
  });
  console.log("UPDATESITES", updateSites);
  chrome.storage.local.set({ sites: updateSites });
  chrome.runtime.sendMessage({ type: "updateSites" });
  window.close();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function renderSites() {
  chrome.storage.local.get(["sites"], function (result) {
    const data = result.sites;
    updateSites = data;
    const sites = document.getElementById("sites");

    for (var i = 0; i < data.length; i++) {
      var name = data[i].name;
      var icon = data[i].icon;
      var check = data[i].whitelist;

      if (data[i].icon) {
        if (check) {
          sites.innerHTML += `<p><input type="checkbox" id="${name}" name="${name}" value="${name}" checked><img class="icon" style="padding-right: 8px;" src="${icon}">${name}</p>`;
        } else {
          sites.innerHTML += `<p><input type="checkbox" id="${name}" name="${name}" value="${name}"><img class="icon" style="padding-right: 8px;" src="${icon}">${name}</p>`;
        }
      } else {
        if (check) {
          sites.innerHTML += `<p><input type="checkbox" id="${name}" name="${name}" value="${name}" checked><img class="icon" style="padding-right: 8px;" src="${placeholder}">${name}</p>`;
        } else {
          sites.innerHTML += `<p><input type="checkbox" id="${name}" name="${name}" value="${name}"><img class="icon" style="padding-right: 8px;" src="${placeholder}">${name}</p>`;
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", renderSites);
document.getElementById("save").addEventListener("click", save_options);
//handle reset
document.getElementById("reset").addEventListener("click", function () {
  location.reload();
  chrome.runtime.sendMessage({ type: "resetSites" });
});
