import { requestGridState } from "./gridHandler.js";
import { clickedTile, resetTileStatus } from "./tileSelectorHandler.js";

// DOM Elements
const templateSelect = document.querySelector("#templateSelect");
const loadTemplateBtn = document.querySelector("#loadTemplateBtn");

// Get references to tile selector buttons
const emptyTileBtn = document.querySelector("#emptyTileBtn");
const wallTileBtn = document.querySelector("#wallTileBtn");
const startTileBtn = document.querySelector("#startTileBtn");
const goalTileBtn = document.querySelector("#goalTileBtn");

// Add event listener to the load button
loadTemplateBtn.addEventListener("click", () => {
  const selectedTemplate = templateSelect.value;
  
  if (!selectedTemplate) {
    showToast("Please select a template first", false);
    return;
  }
  
  loadTemplate(selectedTemplate);
});

/**
 * Load a template onto the grid
 */
function loadTemplate(templateName) {
  switch(templateName) {
    case "empty":
      loadEmptyTemplate();
      break;
    case "randomMaze":
      loadRandomMaze();
      break;
    default:
      console.error("Unknown template:", templateName);
      break;
  }
}

/**
 * Loads an empty template - clears the grid
 */
function loadEmptyTemplate() {
  const grid = document.querySelector("#grid");
  
  // Store the current selected button
  const currentlySelected = document.querySelector("#selectedTileDisplay").innerHTML;
  
  // Select empty tile
  emptyTileBtn.click();
  
  // Set all cells to empty using clickedTile
  for (let i = 0; i < grid.children.length; i++) {
    for (let j = 0; j < grid.children[i].children.length; j++) {
      const cell = grid.children[i].children[j];
      if (cell.dataset.type !== "empty") {
        clickedTile(cell);
      }
    }
  }
  
  // Reset tile status
  resetTileStatus();
  
  // Restore selection (parse HTML to get the button)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = currentlySelected;
  const selectedButton = tempDiv.firstChild;
  if (selectedButton) {
    const buttonType = selectedButton.getAttribute('data-type');
    const buttonToClick = document.querySelector(`button[data-type="${buttonType}"]`);
    if (buttonToClick) buttonToClick.click();
  }
  
  showToast("Empty template loaded", true);
}

/**
 * Generates and loads a random maze/labyrinth
 */
function loadRandomMaze() {
  const grid = document.querySelector("#grid");
  const gridState = requestGridState();
  const rows = gridState.length;
  const cols = gridState[0].length;
  
  // Store currently selected tile type
  const currentlySelected = document.querySelector("#selectedTileDisplay").innerHTML;
  
  // First clear the grid
  clearGrid(grid);
  
  // Generate maze structure
  const maze = generateMazeData(rows, cols);
  
  // Apply walls to the grid
  applyWallsToGrid(maze, grid);
  
  // Place start position at (1,1)
  placeStartPosition(grid);
  
  // Find and place goal position
  placeGoalPosition(maze, grid);
  
  // Restore the original selection
  restoreSelection(currentlySelected);
  
  showToast("Random maze generated", true);
}

/**
 * Clear the grid by clicking on every cell with the empty tile selected
 */
function clearGrid(grid) {
  // First select empty tile
  emptyTileBtn.click();
  
  // Click on all cells to ensure they're empty
  for (let i = 0; i < grid.children.length; i++) {
    for (let j = 0; j < grid.children[i].children.length; j++) {
      const cell = grid.children[i].children[j];
      if (cell.dataset.type !== "empty") {
        clickedTile(cell);
      }
    }
  }
}

/**
 * Generate the maze data structure
 */
function generateMazeData(rows, cols) {
  // Start with a grid of all walls
  const maze = Array(rows).fill().map(() => Array(cols).fill(1)); // 1 = wall, 0 = passage
  
  // Ensure start position at (1,1) will be valid
  const startRow = 1;
  const startCol = 1;
  
  if (startRow < rows && startCol < cols) {
    // Start carving passages
    carveMaze(maze, startRow, startCol);
  }
  
  return maze;
}

/**
 * Apply wall configuration to the grid
 */
function applyWallsToGrid(maze, grid) {
  // Select wall tile
  wallTileBtn.click();
  
  // Apply walls to the grid
  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === 1) { // If it's a wall
        clickedTile(grid.children[i].children[j]);
      }
    }
  }
}

/**
 * Place start position at (1,1)
 */
function placeStartPosition(grid) {
  // Select start tile button
  startTileBtn.click();
  
  // Place start at (1,1)
  if (grid.children.length > 1 && grid.children[1].children.length > 1) {
    clickedTile(grid.children[1].children[1]);
  }
}

/**
 * Find a suitable goal position and place it
 */
function placeGoalPosition(maze, grid) {
  const rows = maze.length;
  const cols = maze[0].length;
  
  // Select goal tile button
  goalTileBtn.click();
  
  // Find suitable goal position in bottom-right quadrant
  let goalPlaced = false;
  
  // Try bottom-right quadrant
  for (let i = rows - 1; i >= Math.floor(rows * 3/4) && !goalPlaced; i--) {
    for (let j = cols - 1; j >= Math.floor(cols * 3/4) && !goalPlaced; j--) {
      if (maze[i][j] === 0 && !(i === 1 && j === 1)) { // Passage and not start
        clickedTile(grid.children[i].children[j]);
        goalPlaced = true;
      }
    }
  }
  
  // If no position found, try bottom-half and right-half
  if (!goalPlaced) {
    for (let i = rows - 1; i >= Math.floor(rows / 2) && !goalPlaced; i--) {
      for (let j = cols - 1; j >= Math.floor(cols / 2) && !goalPlaced; j--) {
        if (maze[i][j] === 0 && !(i === 1 && j === 1)) {
          clickedTile(grid.children[i].children[j]);
          goalPlaced = true;
        }
      }
    }
  }
  
  // Last resort - any valid position that's not start
  if (!goalPlaced) {
    for (let i = rows - 1; i >= 0 && !goalPlaced; i--) {
      for (let j = cols - 1; j >= 0 && !goalPlaced; j--) {
        if (maze[i][j] === 0 && !(i === 1 && j === 1)) {
          clickedTile(grid.children[i].children[j]);
          goalPlaced = true;
        }
      }
    }
  }
}

/**
 * Restore the originally selected tile
 */
function restoreSelection(currentlySelected) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = currentlySelected;
  const selectedButton = tempDiv.firstChild;
  if (selectedButton) {
    const buttonType = selectedButton.getAttribute('data-type');
    const buttonToClick = document.querySelector(`button[data-type="${buttonType}"]`);
    if (buttonToClick) buttonToClick.click();
  }
}

/**
 * Carve passages in the maze using recursive backtracking
 */
function carveMaze(maze, row, col) {
  const rows = maze.length;
  const cols = maze[0].length;
  
  // Mark this cell as a passage
  maze[row][col] = 0;
  
  // Define directions: [row, col]
  const directions = [
    [-2, 0],  // Up
    [0, 2],   // Right
    [2, 0],   // Down
    [0, -2]   // Left
  ];
  
  // Shuffle directions for randomness
  directions.sort(() => Math.random() - 0.5);
  
  // Try each direction
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    const wallRow = row + dr / 2;
    const wallCol = col + dc / 2;
    
    // Check if the new position is valid
    if (
      newRow > 0 && newRow < rows - 1 &&
      newCol > 0 && newCol < cols - 1 &&
      maze[newRow][newCol] === 1
    ) {
      // Remove the wall between cells
      maze[wallRow][wallCol] = 0;
      
      // Continue carving from new position
      carveMaze(maze, newRow, newCol);
    }
  }
}

/**
 * Shows a toast notification
 */
function showToast(message, success = false) {
  Toastify({
    text: message,
    duration: 3000,
    style: {
      background: success 
        ? "linear-gradient(to right top, #047857, #10b981)"
        : "linear-gradient(to right top, #c04000, #ff0000)",
    },
  }).showToast();
}
