export const checkValidURL = (tab) => {
  const { url, status } = tab;
  if (
    url.search(/newtab|chrome:|chrome-extension:/) != -1 ||
    status == "loading"
  ) {
    return false;
  }
  return true;
};

export const getCurrentTab = (hostname = "", favicon, sites) => {
  if (hostname == "") return;
  var unique = true;
  console.log("SITE", sites);
  var isWhitelist = false;
  //check for existing index and whitelist status
  sites.forEach((site, index) => {
    if (hostname == site.name) {
      if (site.whitelist) {
        isWhitelist = true;
        return;
      } else {
        unique = false;
        sites[index].count++;
        return;
      }
    }
  });

  //exit function if whitelisted
  if (isWhitelist) {
    return;
  }

  if (unique) {
    sites.push({
      name: hostname,
      count: 1,
      icon: favicon,
      whitelist: false,
    });
  }

  //sort from largest to smallest
  sites.sort((a, b) => b.count - a.count);

  //push to storage
  chrome.storage.local.set({ sites: sites });
};
