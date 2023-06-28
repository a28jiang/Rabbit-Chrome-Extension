// Initialize variables to track the starting position of the drag
let offsetX = 0;
let offsetY = 0;
let imageWidth = 200;

// Create a new <div> element for the GIF overlay
var gifOverlay = document.createElement("div");
gifOverlay.style.position = "fixed";
gifOverlay.style.top = "0";
gifOverlay.style.left = "0";
gifOverlay.style.width = "100%";
gifOverlay.style.height = "100%";
gifOverlay.style.zIndex = "999";
gifOverlay.style.pointerEvents = "none";

var divOverlay = document.createElement("div");
divOverlay.style.zIndex = "999";

// Create a <span> element for the "X" button
var closeButton = document.createElement("span");
closeButton.innerHTML = "✕";
closeButton.style.position = "absolute";
closeButton.style.left = offsetX;
closeButton.style.top = offsetY + gifOverlay.offsetWidth + 20 + "px";
closeButton.style.cursor = "pointer";
closeButton.style.fontSize = "22px";
closeButton.style.pointerEvents = "auto"; // Enable pointer

function toggleElements(config) {
  if ("image" in config) gifImage.style.display = config.image ? "" : "none";
  if ("icons" in config) closeButton.style.display = config.icons ? "" : "none";
  if ("icons" in config)
    resizeButton.style.display = config.icons ? "" : "none";
}

// Create a <span> element for the resize icon
var resizeButton = document.createElement("span");
resizeButton.innerHTML = "⤡";
resizeButton.style.position = "absolute";
resizeButton.style.left = offsetX;
resizeButton.style.top = offsetY + gifOverlay.offsetWidth + "px";
resizeButton.style.cursor = "nwse-resize";
resizeButton.style.fontSize = "32px";
resizeButton.style.pointerEvents = "auto"; // Enable pointer
var isResizing = false;
var startX = 0;
var initialWidth = imageWidth;

// Create an <img> element for the GIF
var gifImage = document.createElement("img");
gifImage.src = chrome.runtime.getURL("assets/happy.gif");
gifImage.width = imageWidth;
gifImage.style.position = "absolute";
gifImage.style.left = offsetX != 0 ? `${offsetX}px` : "90%";
gifImage.style.top = offsetY != 0 ? `${offsetY}px` : "90%";
gifImage.style.transform = "translate(-50%, -50%)";
gifImage.style.maxWidth = "100%";
gifImage.style.maxHeight = "100%";
gifImage.style.cursor = "grab";
gifImage.style.pointerEvents = "auto"; // Enable pointer

function updateImagePositions({
  left = offsetX,
  top = offsetY,
  width = imageWidth,
}) {
  offsetX = left;
  offsetY = top;
  imageWidth = width;
  gifImage.style.left = left + "px";
  resizeButton.style.left = left + width * 0.6 + "px";
  closeButton.style.left = left + width * 0.6 + 30 + "px";

  gifImage.style.width = width + "px";

  gifImage.style.top = top + "px";
  resizeButton.style.top = top - width / 2 - 6 + "px";
  closeButton.style.top = top - width / 2 + "px";
}

// Event handler for drag
function handleDrag(event) {
  // Prevent the default browser behavior of selecting the dragged content
  event.preventDefault();
  if (event.clientX == 0 && event.clientY == 0) {
    return;
  }
  updateImagePositions({ left: event.clientX, top: event.clientY });
}

function handleDragEnd(event) {
  chrome.storage.local.set({ offsetX: event.clientX, offsetY: event.clientY });
}

chrome.storage.local.get(
  ["state", "offsetX", "offsetY", "imageWidth", "pauseState"],
  (result) => {
    const { state, offsetX, offsetY, imageWidth, pauseState } = result;

    if (pauseState) {
      toggleElements({ image: false, icons: false });
      return;
    }
    toggleElements({ image: true });

    if (state > 70) {
      gifImage.src = chrome.runtime.getURL("assets/happy.gif");
    } else if (state > 49) {
      gifImage.src = chrome.runtime.getURL("assets/chill.gif");
    } else if (state > 30) {
      gifImage.src = chrome.runtime.getURL("assets/meh.gif");
    } else {
      gifImage.src = chrome.runtime.getURL("assets/cry.gif");
    }

    updateImagePositions({
      left: offsetX,
      top: offsetY,
      width: imageWidth,
    });
  }
);

function main() {
  // Append the <img> element to the <div> overlay
  divOverlay.appendChild(closeButton);
  divOverlay.appendChild(resizeButton);
  divOverlay.appendChild(gifImage);
  gifOverlay.appendChild(divOverlay);

  // Append the GIF overlay to the document body
  document.body.appendChild(gifOverlay);
}

main();

// Listener for local storage changes
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === "local") {
    // Change animation
    if (changes["state"]) {
      const data = changes["state"]["newValue"];
      if (data > 70) {
        gifImage.src = chrome.runtime.getURL("assets/happy.gif");
      } else if (data > 49) {
        gifImage.src = chrome.runtime.getURL("assets/chill.gif");
      } else if (data > 30) {
        gifImage.src = chrome.runtime.getURL("assets/meh.gif");
      } else {
        gifImage.src = chrome.runtime.getURL("assets/cry.gif");
      }
    }
    // Toggle GIF on/off
    if (changes["pauseState"]) {
      console.log(changes);
      if (!changes["pauseState"]["newValue"]) {
        toggleElements({ image: true });
      } else {
        toggleElements({ image: false, icons: false });
      }
    }
  }
});

// Add event listeners for drag events
gifImage.addEventListener("dragstart", handleDragStart);
gifImage.addEventListener("drag", handleDrag);
gifImage.addEventListener("dragend", handleDragEnd);
document.addEventListener("dragover", function (e) {
  e.preventDefault();
});

document.addEventListener("mouseenter", function (e) {
  e.preventDefault();
});

gifImage.addEventListener("mouseenter", function () {
  toggleElements({ image: true, icons: true });
});

gifImage.addEventListener("mouseleave", function () {
  setTimeout(function () {
    toggleElements({ icons: false });
  }, 5000);
});
// Event handler for drag start
function handleDragStart(event) {
  // Store the initial position of the mouse cursor relative to the image position
  offsetX = event.clientX - gifImage.offsetLeft;
  offsetY = event.clientY - gifImage.offsetTop;

  // Set the effect to "move" to indicate that dragging is allowed
  event.dataTransfer.effectAllowed = "move";
}

resizeButton.addEventListener("mousedown", function (event) {
  isResizing = true;
  startX = event.clientX;
  initialWidth = imageWidth;
});

window.addEventListener("mousemove", function (event) {
  if (isResizing) {
    var deltaX = startX - event.clientX;
    imageWidth = initialWidth + deltaX;
    updateImagePositions({ width: imageWidth });
  }
});

window.addEventListener("mouseup", function () {
  chrome.storage.local.set({ imageWidth: imageWidth });
  isResizing = false;
});

closeButton.addEventListener("click", function () {
  toggleElements({ image: false, icons: false });
  chrome.runtime.sendMessage({ type: "pauseSites" });
});

// maintain bounds
window.addEventListener("resize", function () {
  const imgHeight = this.window.innerHeight - gifImage.height;
  const imgWidth = this.window.innerWidth - gifImage.width;
  if (imgHeight < offsetY) {
    updateImagePositions({
      top: imgHeight,
    });
    chrome.storage.local.set({
      offsetY: imgHeight,
    });
  }
  if (imgWidth < offsetX) {
    updateImagePositions({
      left: imgWidth,
    });
    chrome.storage.local.set({
      offsetX: imgWidth,
    });
  }
});
