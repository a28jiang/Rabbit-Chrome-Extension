document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["sites"], function (result) {
    const data = result.sites;
    const topSites = document.getElementById("topsites");

    for (var i = 0; i < 5; i++) {
      topSites.innerHTML += `<p><img class="icon" src="${data[i].icon}">   ${data[i].name}</p>`;
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
      header.style.backgroundColor = "#c0c0c0";
      gifDiv.innerHTML = `<img width="150px" src="./assets/chill.gif">`;
      score.innerHTML = `<h2 class="score" style="color: #c0c0c0;">${Math.floor(
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
});

//handle reset
document.getElementById("reset").addEventListener("click", function () {
  location.reload();
  chrome.runtime.sendMessage({ type: "resetSites" });
});
