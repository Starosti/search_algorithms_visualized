import { clickedTile, resetTileStatus } from "./tileSelectorHandler.js";

const grid = document.querySelector("#grid");
const gridRowsSelector = document.querySelector("#gridY");
const gridColsSelector = document.querySelector("#gridX");
const gridUpdateBtn = document.querySelector("#updateGridBtn");
const GRID_X = 20;
const GRID_Y = 6;

// populate gridrows and gridcols selectors
for (let i = 1; i <= 50; i++) {
  let option = document.createElement("option");
  option.value = i;
  option.innerText = i;
  gridRowsSelector.appendChild(option);
  gridColsSelector.appendChild(option.cloneNode(true));
}

gridRowsSelector.value = GRID_Y;
gridColsSelector.value = GRID_X;

// create multiple cells
let createRow = (num) => {
  let row = document.createElement("div");
  row.classList.add("flex", "flex-row", "w-full", "h-full");
  for (let i = 0; i < num; i++) {
    let cell = document.createElement("button");
    cell.classList.add(
      "inline-block",
      "w-full",
      "h-full",
      "border",
      "border-black",
      "bg-white"
    );
    cell.dataset.type = "empty";
    cell.addEventListener("click", () => {
      clickedTile(cell);
    });
    row.appendChild(cell);
  }
  return row;
};

let populateGrid = (rows, cols) => {
  for (let i = 0; i < rows; i++) {
    grid.appendChild(createRow(cols));
  }
};

populateGrid(GRID_Y, GRID_X);

gridUpdateBtn.addEventListener("click", () => {
  console.log(requestGridState());
  grid.innerHTML = "";
  populateGrid(gridRowsSelector.value, gridColsSelector.value);
  resetTileStatus();
});

let requestGridState = () => {
  let gridState = [];
  for (let i = 0; i < grid.children.length; i++) {
    gridState.push([]);
    for (let j = 0; j < grid.children[i].children.length; j++) {
      gridState[i].push(grid.children[i].children[j].dataset.type);
    }
  }
  return gridState;
};
