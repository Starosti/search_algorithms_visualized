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

let clickedTile = (tile) => {
  tile.style.borderColor = "black";
  if (tile.dataset.type === selectedTile.dataset.type) {
    if (tile.dataset.type === "goal") goalExists = false;
    if (tile.dataset.type === "start") startExists = false;
    tile.dataset.type = "empty";
    tile.style.backgroundColor = "white";
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
          duration: 1000,
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
          duration: 1000,
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
};

let resetTileStatus = () => {
  startExists = false;
  goalExists = false;
};

export { clickedTile, resetTileStatus };
