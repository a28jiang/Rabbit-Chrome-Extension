var sites = [];
var paused = false;

var getCurrentTab = (hostname, favicon) => {
  if (!paused) {
    var unique = true;

    var isWhitelist = false;
    //check for existing index and whitelist status
    sites.forEach((site, index) => {
      if (hostname == site.name) {
        if (site.whitelist) {
          console.log("SITE WHITELISTED");
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
    console.log(sites);
  }
};

var sortProcrastination = () => {
  chrome.storage.local.get(["sites"], function (result) {
    var procrastination = 50;
    const data = result.sites;
    var isLowData = data.length < 6;

    //handle low data case
    // if (data.length < 5) {
    //   chrome.storage.local.set({ state: procrastination });
    //   setIcon(procrastination);
    //   return;
    // }

    //generate procrastination index
    for (var i = 0; i < (isLowData ? data.length : 6); i++) {
      // console.log(data[i].name, siteValue(data[i].name));
      procrastination =
        procrastination + siteValue(data[i].name) * (1.4 - 0.1 * i);
    }

    //handling procrastination exceeding
    if (procrastination < 0) procrastination = 0;
    if (procrastination > 100) procrastination = 100;

    //trigger icon change
    setIcon(procrastination);
    // console.log("P_INDEX", procrastination);

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
      /facebook|imdb|instagram|tiktok|twitter|fandom|9gag|buzzfeed|forbes|kongregate|y8/
    ) != -1
  )
    return -21;
  if (
    site.search(
      /amazon|reddit|youtube|ebay|pinterest|aliexpress|taobao|wish.|yesstyle/
    ) != -1
  )
    return -14;
  if (site.search(/kijiji|craigslist|messenger/) != -1) return -5;

  //productive sites
  if (site.search(/ctv|global|cbc|abc|torontosun|cp24|nationalpost|bbc/) != -1)
    return 6;
  if (site.search(/outlook|edu|gmail|google|wikipedia/) != -1) return 9;
  if (
    site.search(
      /docs.|drive.|quora|yahoo|news|keep.|masterclass|coursehero|medium|course|quizlet|kahoot|linkedin/
    ) != -1
  )
    return 13;

  if (
    site.search(
      /waterloo|mcmaster|uwo|utoronto|uottawa|ryerson|uoguelph|mcgill|york|queensu|classroom|canvas.net|edmodo/
    ) != -1
  )
    return 20;
  if (
    site.search(
      /stackoverflow|chegg|behance|w3schools|github|developer|learn|office|coursera|udemy|scholar/
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
  } else if (procrastination > 30) {
    mood = "meh";
  } else {
    mood = "cry";
  }

  //optional badge
  //chrome.browserAction.setBadgeText({ text: `${Math.floor(procrastination)}` });

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
setInterval(sortProcrastination, 3000);
chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      var url = tabs[0].url;
      var favicon = tabs[0].favIconUrl;

      hostname = new URL(url).hostname;
      console.log("onActivated", hostname);
      getCurrentTab(hostname, favicon);
    }
  );
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var url = tab.url;
  var status = tab.status;

  if (url.search(/newtab|chrome:/) != -1 || status == "loading") {
    console.log("EXITED");
    return;
  }

  if (status == "complete") {
    hostname = new URL(url).hostname;
    var favicon = tab.favIconUrl;

    console.log("onUpdated", hostname);
    getCurrentTab(hostname, favicon);
  }
});
