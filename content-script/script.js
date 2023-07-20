// Initialize variables to track the starting position of the drag
let [offsetX, offsetY, imageWidth, initialWidth, isResizing, startX, startY] = [
  0,
  0,
  100,
  100,
  false,
  0,
  0,
];

/* ------------------------ COMPONENTS ------------------------ */

// Create a new <div> elements for the GIF overlay
let gifOverlay = document.createElement("div");
gifOverlay.classList.add("gif-overlay-rabbit");
let divOverlay = document.createElement("div");
divOverlay.classList.add("div-overlay-rabbit");

// Create a <span> element for the "X" button
let closeButton = document.createElement("span");
closeButton.innerHTML = "✕";
closeButton.style.left = offsetX;
closeButton.style.top = offsetY + gifOverlay.offsetWidth + "px";
closeButton.classList.add("close-button-rabbit");

// Create a <span> element for the resize icon
let resizeButton = document.createElement("span");
resizeButton.style.left = offsetX;
resizeButton.style.top = offsetY + gifOverlay.offsetWidth + "px";
resizeButton.innerHTML = "⤡";
resizeButton.classList.add("resize-button-rabbit");

// Create an <img> element for the GIF
let gifImage = document.createElement("img");
gifImage.src = chrome.runtime.getURL("assets/happy.gif");
gifImage.width = imageWidth;
gifImage.style.left = offsetX != 0 ? `${offsetX}px` : "90%";
gifImage.style.top = offsetY != 0 ? `${offsetY}px` : "90%";
gifImage.classList.add("gif-image-rabbit");
gifImage.setAttribute("filter", "none");
let blank = new Image(0, 0);
blank.src =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/* ------------------------ LISTENERS ------------------------ */

// Listens to Chrome storage changes
function registerStorageListener() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local") {
      // Change animation
      if (changes["state"]) {
        const data = changes["state"]["newValue"];
        swapGifImage(data);
      }

      // Toggle GIF on/off
      if (changes["showRabbit"]) {
        if (changes["showRabbit"]["newValue"]) {
          updateImagePositions({ defaultImage: true });
          toggleElements({ image: true });
        } else {
          toggleElements({ image: false, icons: false });
        }
      }
    }
  });
}

// When user drags Rabbit overlay
function registerDragListeners() {
  // Image Drag Listeners
  gifImage.addEventListener("dragstart", (event) => {
    // Store the initial position of the mouse cursor relative to the image position
    offsetX = event.clientX - gifImage.offsetLeft;
    offsetY = event.clientY - gifImage.offsetTop;
    event.dataTransfer.setDragImage(blank, 0, 0);
    // Set the effect to "move" to indicate that dragging is allowed
    event.dataTransfer.effectAllowed = "move";
    document.body.style.userSelect = "none";
  });

  gifImage.addEventListener("drag", (event) => {
    // Prevent the default browser behavior of selecting the dragged content
    event.preventDefault();
    if (event.clientX == 0 && event.clientY == 0) {
      return;
    }
    updateImagePositions({ left: event.clientX, top: event.clientY });
  });
  gifImage.addEventListener("dragend", (event) => {
    document.body.style.userSelect = "";
    chrome.storage.local.set({
      offsetX: event.clientX,
      offsetY: event.clientY,
    });
  });
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
  document.addEventListener("mouseenter", function (e) {
    e.preventDefault();
  });
}

// When user toggles display/ hide options
function registerToggleListeners() {
  // Element hover handler
  gifImage.addEventListener("mouseenter", function () {
    toggleElements({ image: true, icons: true });
  });
  gifImage.addEventListener("mouseleave", function () {
    setTimeout(function () {
      toggleElements({ icons: false });
    }, 5000);
  });

  // Close button handler
  closeButton.addEventListener("click", () => {
    toggleElements({ image: false, icons: false });
    chrome.runtime.sendMessage({ type: "showRabbit" });
  });
}

// When user resizes Rabbit overlay
function registerResizeListeners() {
  resizeButton.addEventListener("mousedown", function (event) {
    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    initialWidth = imageWidth;
  });

  window.addEventListener("mousemove", (event) => {
    if (isResizing) {
      event.preventDefault();
      const deltaX = startX - event.clientX;
      const deltaY = startY - event.clientY;
      imageWidth = initialWidth + (deltaX + deltaY) / 2;
      updateImagePositions({ width: imageWidth });
    }
  });

  window.addEventListener("mouseup", () => {
    chrome.storage.local.set({ imageWidth: imageWidth });
    isResizing = false;
  });
}

// Keep Rabbit in boundaries when window is resized
function windowResizerListener() {
  // maintain bounds
  window.addEventListener("resize", () => {
    const imgHeight = this.window.innerHeight - gifImage.height;
    const imgWidth = this.window.innerWidth - gifImage.width;
    if (imgHeight < offsetY) {
      updateImagePositions({ top: imgHeight });
      chrome.storage.local.set({ offsetY: imgHeight });
    }
    if (imgWidth < offsetX) {
      updateImagePositions({ left: imgWidth });
      chrome.storage.local.set({ offsetX: imgWidth });
    }
  });
}

/* ------------------------ UTILITY FUNCTIONS ------------------------ */

// Function for displaying/toggling elements

function toggleElements(config) {
  if ("image" in config) gifImage.style.display = config.image ? "" : "none";
  if ("icons" in config) closeButton.style.display = config.icons ? "" : "none";
  if ("icons" in config)
    resizeButton.style.display = config.icons ? "" : "none";
}

// Function for updating element positions
function updateImagePositions({
  left = offsetX,
  top = offsetY,
  width = imageWidth,
  defaultImage = false,
}) {
  if (defaultImage) {
    offsetX = 0;
    offsetY = 0;
    imageWidth = 100;
    closeButton.style.left = offsetX;
    closeButton.style.top = offsetY + gifOverlay.offsetWidth + "px";

    resizeButton.style.left = offsetX;
    resizeButton.style.top = offsetY + gifOverlay.offsetWidth + "px";

    gifImage.width = imageWidth;
    gifImage.style.left = offsetX != 0 ? `${offsetX}px` : "90%";
    gifImage.style.top = offsetY != 0 ? `${offsetY}px` : "90%";
  } else {
    offsetX = left;
    offsetY = top;
    imageWidth = width;

    gifImage.style.left = defaultImage ? "90%" : left + "px";
    resizeButton.style.left = left + width * 0.6 + "px";
    closeButton.style.left = left + width * 0.6 + 30 + "px";

    gifImage.style.width = width + "px";

    gifImage.style.top = top + "px";
    resizeButton.style.top = top - width / 2 - 6 + "px";
    closeButton.style.top = top - width / 2 + "px";
  }
}

function swapGifImage(state) {
  if (state > 70) {
    gifImage.src = chrome.runtime.getURL("assets/happy.gif");
  } else if (state > 49) {
    gifImage.src = chrome.runtime.getURL("assets/chill.gif");
  } else if (state > 30) {
    gifImage.src = chrome.runtime.getURL("assets/meh.gif");
  } else {
    gifImage.src = chrome.runtime.getURL("assets/cry.gif");
  }
}

// Fetch initial overlay data from chrome storage
function fetchData() {
  chrome.storage.local.get(
    ["state", "offsetX", "offsetY", "imageWidth", "showRabbit"],
    (result) => {
      const { state, offsetX, offsetY, imageWidth, showRabbit } = result;
      if (showRabbit) {
        toggleElements({ image: true });
        swapGifImage(state);
        updateImagePositions({
          left: offsetX,
          top: offsetY,
          width: imageWidth,
        });
      } else {
        toggleElements({ image: false, icons: false });
      }
    }
  );
}

/* ------------------------ MAIN ------------------------ */

function main() {
  divOverlay.appendChild(closeButton);
  divOverlay.appendChild(resizeButton);
  divOverlay.appendChild(gifImage);
  gifOverlay.appendChild(divOverlay);
  document.body.appendChild(gifOverlay);
  fetchData();
  registerStorageListener();
  registerToggleListeners();
  registerDragListeners();
  registerResizeListeners();
  windowResizerListener();
}

main();
setInterval(() => fetchData(), 1000 * 30);
