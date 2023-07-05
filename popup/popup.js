const STYLE_MAP = {
  happy: {
    color: "#BEE5C4",
    tag: "happy",
    label: "Productive Rabbit"
  },
  chill: {
    color: "#BFECEC",
    tag: "chill",
    label: "Rabbit is chilling"
  },
  meh: {
    color: "#F8C593",
    tag: "meh",
    label: "Slacking Rabbit"
  },
  cry: {
    color: "#f59d92",
    tag: "cry",
    label: "Rabbit gives up"
  }
}

const LINK = "https://reactnativecode.com/wp-content/uploads/2018/02/Default_Image_Thumbnail.png";

// Dynamically Inject HTML
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["sites"], function (result) {
    const data = result.sites;
    const topSites = document.getElementById("topsites");

    for (let i = 0; i < Math.min(5, data.length); i++) {
      if (data[i]['icon']) {
        topSites.innerHTML += `<p><img class="icon" style="padding-right: 8px;" src="${data[i].icon}">${data[i].name}</p>`;
      } else {
        topSites.innerHTML += `<p><img class="icon" style="padding-right: 8px;" src="${LINK}">${data[i].name}</p>`;
      }
    }
  });
})

// Chrome Storage Handler
chrome.storage.local.get(["state", "pauseState"], function (result) {
  handleState(result['state'])
  handlePause(result['pauseState'])
});

function handleState(data) {
  const gifDiv = document.getElementById("gif");
  const header = document.getElementById("header");
  const score = document.getElementById("score");

  let config;
  if (data > 70) {
    config = STYLE_MAP['happy']
  } else if (data > 49) {
    config = STYLE_MAP['chill']
  } else if (data > 30) {
    config = STYLE_MAP['meh']
  } else {
    config = STYLE_MAP['gif']
  }
  document.getElementById("message").innerHTML = config['label'];
  header.style.backgroundColor = config['color'];
  gifDiv.innerHTML = `<img width="150px" src="../assets/${config['tag']}.gif">`;
  score.innerHTML = `<h2 class="score" style="color: ${config['color']};">${data}</h2>`;
}

function handlePause(isPaused) {
  const button = document.getElementById("pause");

  // Toggle Display/Hide Icon
  if (isPaused) {
    button.innerHTML = `<img class="headerLeft"  src="../assets/play.png"></img>`;
  } else {
    button.innerHTML = `<img class="headerLeft"  src="../assets/pause.png"></img>`;
  }
}


//handle reset
document.getElementById("pause").addEventListener("click", function () {
  location.reload();
  chrome.runtime.sendMessage({ type: "pauseSites" });
  chrome.storage.local.get(["gifClose"], (res) => {
    chrome.storage.local.set({ gifClose: !res["gifClose"] });
  });
});

document.getElementById("settings").addEventListener("click", function () {
  chrome.runtime.openOptionsPage();
});

document.getElementById("pause").addEventListener("click", function () {
  chrome.storage.local.set({ gifClose: false });
});
