var sites = [];

var getCurrentTab = () => {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      var unique = true;
      var url = tabs[0].url;

      //exclude new tabs
      if (url.search("newtab") != -1 || url.length == 0) {
        return;
      }

      hostname = new URL(url).hostname;

      //check for existing index
      sites.forEach((site, index) => {
        if (hostname == site.name) {
          unique = false;
          sites[index].count++;
        }
      });
      if (unique) {
        sites.push({ name: hostname, count: 1, icon: tabs[0].favIconUrl });
      }

      //sort from largest to smallest
      sites.sort((a, b) => b.count - a.count);

      //push to storage
      chrome.storage.local.set({ sites: sites });
      console.log(sites);
    }
  );
};

var sortProcrastination = () => {
  chrome.storage.local.get(["sites"], function (result) {
    var procrastination = 50;
    const data = result.sites;
    var isLowData = data.length < 5;

    //handle low data case
    // if (data.length < 5) {
    //   chrome.storage.local.set({ state: procrastination });
    //   setIcon(procrastination);
    //   return;
    // }

    //generate procrastination index
    for (var i = 0; i < (isLowData ? data.length : 6); i++) {
      console.log(data[i].name, siteValue(data[i].name));
      procrastination =
        procrastination + siteValue(data[i].name) * (1.4 - 0.1 * i);
    }

    //handling procrastination exceeding
    if (procrastination < 0) procrastination = 0;
    if (procrastination > 100) procrastination = 100;

    //trigger icon change
    setIcon(procrastination);
    console.log("P_INDEX", procrastination);

    //set procrastination
    chrome.storage.local.set({ state: procrastination });
  });
};

var siteValue = (site) => {
  //procrastination sites
  if (
    site.search(
      /netflix|twitch|kissanime|dramacool|youku|viki|hulu|dramafever|asiancrush|hbo|disneyplus|primevideo|viewster|crunchryoll/
    ) != -1
  )
    return -26;
  if (
    site.search(
      /facebook|imdb|instagram|tiktok|twitter|fandom|9gag|buzzfeed|forbes|kongregate/
    ) != -1
  )
    return -17;
  if (site.search(/amazon|youtube|ebay|pinterest|aliexpress|taobao/) != -1)
    return -8;
  if (site.search(/reddit|kijiji|craigslist|messenger/) != -1) return -5;

  //productive sites
  if (site.search(/outlook|edu|gmail/) != -1) return 4;
  if (site.search(/drive|docs.|drive./) != -1) return 13;
  if (
    site.search(
      /stackoverflow|medium|behance|w3schools|github|waterloo|learn|office/
    ) != -1
  )
    return 24;

  return 0;
};

var setIcon = (procrastination) => {
  var mood = "chill";

  if (procrastination > 70) {
    mood = "happy";
  } else if (procrastination > 49) {
    mood = "chill";
  } else {
    mood = "cry";
  }

  var i = 0;
  //assemble gif for mood
  function iconLoop() {
    setTimeout(function timer() {
      chrome.browserAction.setIcon({
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

//reset sites
chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == "resetSites") {
    console.log("reset!");
    sites = [];
    chrome.storage.local.set({ sites: sites });
    chrome.storage.local.set({ state: 50 });
  }
});

setInterval(sortProcrastination, 3000);
getCurrentTab();
chrome.tabs.onActivated.addListener(getCurrentTab);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var url = tab.url;
  var status = tab.status;

  console.log("TAB", tab);
  if (url !== undefined && status == "complete") {
    console.log("UPDATED");
    getCurrentTab();
  }
});
