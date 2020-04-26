const placeholder =
  "https://reactnativecode.com/wp-content/uploads/2018/02/Default_Image_Thumbnail.png";

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["sites"], function (result) {
    const data = result.sites;
    const topSites = document.getElementById("topsites");

    for (var i = 0; i < 5; i++) {
      if (data[i].icon) {
        topSites.innerHTML += `<p><img class="icon" style="padding-right: 8px;" src="${data[i].icon}">${data[i].name}</p>`;
      } else {
        topSites.innerHTML += `<p><img class="icon" style="padding-right: 8px;" src="${placeholder}">${data[i].name}</p>`;
      }
    }
  });

  chrome.storage.local.get(["state"], function (result) {
    const data = result.state;
    const gifDiv = document.getElementById("gif");
    const header = document.getElementById("header");
    const score = document.getElementById("score");

    if (data > 70) {
      document.getElementById("message").innerHTML = "Productive Rabbit";
      header.style.backgroundColor = "#bee5c4";
      gifDiv.innerHTML = `<img width="150px" src="./assets/happy.gif">`;
      score.innerHTML = `<h2 class="score" style="color: #bee5c4;">${Math.floor(
        data
      )}</h2>`;
    } else if (data > 49) {
      document.getElementById("message").innerHTML = "Rabbit is chilling";
      header.style.backgroundColor = "#BFECEC";
      gifDiv.innerHTML = `<img width="150px" src="./assets/chill.gif">`;
      score.innerHTML = `<h2 class="score" style="color: #BFECEC;">${Math.floor(
        data
      )}</h2>`;
    } else {
      document.getElementById("message").innerHTML = "Rabbit gives up";
      header.style.backgroundColor = "#f59d92";
      gifDiv.innerHTML = `<img width="150px" src="./assets/cry.gif">`;
      score.innerHTML = `<h2 class="score" style="color: #f59d92;">${Math.floor(
        data
      )}</h2>`;
    }
  });

  chrome.storage.local.get(["pauseState"], function (result) {
    var isPaused = result.pauseState;

    console.log("ISPAUSED", isPaused);
    const button = document.getElementById("pause");
    const overlay = document.getElementById("overlay");

    //switch image
    if (isPaused) {
      button.innerHTML = `<img class="headerLeft"  src="./assets/play.png/"></img>`;
      overlay.classList.add("overlay");
    } else {
      button.innerHTML = `<img class="headerLeft"  src="./assets/pause.png/"></img>`;
      overlay.classList.remove("overlay");
    }
  });
});

//handle reset
document.getElementById("pause").addEventListener("click", function () {
  location.reload();
  chrome.runtime.sendMessage({ type: "pauseSites" });
});

//handle setting
//handle reset
document.getElementById("settings").addEventListener("click", function () {
  chrome.runtime.openOptionsPage();
});
