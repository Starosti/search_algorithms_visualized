// Create a custom event for grid changes
const gridChangedEvent = new CustomEvent('gridChanged');

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
      
      switch (cell.dataset.type) {
        case "empty":
          cell.style.backgroundColor = "white";
          cell.style.borderColor = "black";
          break;
        case "wall":
          cell.style.backgroundColor = "black";
          cell.style.borderColor = "white";
          break;
        case "start":
          cell.style.backgroundColor = "limegreen";
          cell.style.borderColor = "black";
          break;
        case "goal":
          cell.style.backgroundColor = "orange";
          cell.style.borderColor = "black";
          break;
      }
    }
  }
};

let clickedTile = (tile) => {
  tile.style.borderColor = "black";
  if (tile.dataset.type === selectedTile.dataset.type) {
    if (tile.dataset.type === "goal") goalExists = false;
    if (tile.dataset.type === "start") startExists = false;
    tile.dataset.type = "empty";
    tile.style.backgroundColor = "white";
    
    // Dispatch grid changed event
    document.dispatchEvent(gridChangedEvent);
    return;
  }
  switch (selectedTile.dataset.type) {
    case "empty":
      tile.style.backgroundColor = "white";
      break;
    case "wall":
      tile.style.backgroundColor = "black";
      tile.style.borderColor = "white";
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
      tile.style.backgroundColor = "limegreen";
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
      tile.style.backgroundColor = "orange";
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
