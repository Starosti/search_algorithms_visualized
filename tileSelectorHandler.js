// Create a custom event for grid changes
const gridChangedEvent = new CustomEvent("gridChanged");

const selectedTileDisplay = document.querySelector("#selectedTileDisplay");
const selectableTilesContainer = document.querySelector(
  "#selectableTilesContainer"
);
let goalExists = false;
let startExists = false;

const tileBtns = [];

for (let i in selectableTilesContainer.children) {
  if (selectableTilesContainer.children[i].tagName === "BUTTON") {
    tileBtns.push(selectableTilesContainer.children[i]);
    selectableTilesContainer.children[i].addEventListener("click", () => {
      selectedTile = tileBtns[i];
      selectedTileDisplay.innerHTML = selectedTile.outerHTML;
    });
  }
}

let selectedTile = tileBtns[0];
selectedTile.dispatchEvent(new Event("click"));

// Function to reset visual state based on dataset.type
const resetVisuals = () => {
  const grid = document.querySelector("#grid");

  for (let i = 0; i < grid.children.length; i++) {
    for (let j = 0; j < grid.children[i].children.length; j++) {
      const cell = grid.children[i].children[j];

      // Remove all possible background and search visualization classes
      cell.className = cell.className.replace(/bg-\S+/g, "");
      cell.className = cell.className.replace(/search-visited/g, "");
      cell.className = cell.className.replace(/search-path/g, "");
      cell.className = cell.className.replace(/animate-show/g, "");

      switch (cell.dataset.type) {
        case "empty":
          cell.classList.add("bg-white");
          break;
        case "wall":
          cell.classList.add("bg-gray-900");
          break;
        case "start":
          cell.classList.add("bg-green-400");
          break;
        case "goal":
          cell.classList.add("bg-orange-400");
          break;
      }
    }
  }
};

let clickedTile = (tile) => {
  // Helper function to clean and set background classes
  const setTileStyle = (bgClass) => {
    tile.className = tile.className.replace(/bg-\S+/g, "");
    tile.className = tile.className.replace(/search-visited/g, "");
    tile.className = tile.className.replace(/search-path/g, "");
    tile.className = tile.className.replace(/animate-show/g, "");
    tile.classList.add(bgClass);
  };

  if (tile.dataset.type === selectedTile.dataset.type) {
    if (tile.dataset.type === "goal") goalExists = false;
    if (tile.dataset.type === "start") startExists = false;
    tile.dataset.type = "empty";
    setTileStyle("bg-white");

    // Dispatch grid changed event
    document.dispatchEvent(gridChangedEvent);
    return;
  }

  switch (selectedTile.dataset.type) {
    case "empty":
      setTileStyle("bg-white");
      break;
    case "wall":
      setTileStyle("bg-gray-900");
      break;
    case "start":
      if (startExists) {
        Toastify({
          text: "Start already exists!",
          duration: 2000,
          style: {
            background: "linear-gradient(to right top, #c04000, #ff0000)",
          },
        }).showToast();
        return;
      }
      setTileStyle("bg-green-400");
      startExists = true;
      break;
    case "goal":
      if (goalExists) {
        Toastify({
          text: "Goal already exists!",
          duration: 2000,
          style: {
            background: "linear-gradient(to right top, #c04000, #ff0000)",
          },
        }).showToast();
        return;
      }
      setTileStyle("bg-orange-400");
      goalExists = true;
      break;
  }
  if (tile.dataset.type === "goal") goalExists = false;
  if (tile.dataset.type === "start") startExists = false;
  tile.dataset.type = selectedTile.dataset.type;

  // Dispatch grid changed event
  document.dispatchEvent(gridChangedEvent);
};

let resetTileStatus = () => {
  startExists = false;
  goalExists = false;

  // Reset visuals when tile status is reset
  resetVisuals();

  // Dispatch grid changed event
  document.dispatchEvent(gridChangedEvent);
};

export { clickedTile, resetTileStatus, resetVisuals, gridChangedEvent };
