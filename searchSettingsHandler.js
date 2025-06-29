import { requestGridState } from "./gridHandler.js";
import { resetVisuals } from "./tileSelectorHandler.js";

// Track search state
let searchInProgress = false;
let searchTimeouts = [];

// ----------- ELEMENTS -----------

const algorithmSelector = document.querySelector("#algorithm");
const prioritySelector = document.querySelector("#priority");
const startSearchBtn = document.querySelector("#startSearchBtn");
const grid = document.querySelector("#grid");
const stepDelaySlider = document.querySelector("#stepDelay");
const delayValueDisplay = document.querySelector("#delayValue");

// Modal elements
const modal = document.querySelector("#infoModal");
const modalTitle = document.querySelector("#modalTitle");
const modalContent = document.querySelector("#modalContent");
const closeModal = document.querySelector("#closeModal");

// Set up the question mark icon event listeners
const algorithmInfoIcon = document.querySelector(
  'label[for="algorithm"] + div a'
);
const priorityInfoIcon = document.querySelector(
  'label[for="priority"] + div a'
);

// ----------- GRID CHANGE LISTENER -----------

// Listen for grid changes and reset visualizations
document.addEventListener("gridChanged", () => {
  // Clear all timeouts to stop any running visualizations
  searchTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  searchTimeouts = [];

  // Reset search state
  searchInProgress = false;

  // Update button text back to "Start Search"
  updateButtonText();

  // Use the resetVisuals function to ensure correct visual state
  resetVisuals();
});

// ----------- SLIDER CODE -----------

// Update the delay value display when the slider changes
stepDelaySlider.addEventListener("input", () => {
  delayValueDisplay.textContent = `${stepDelaySlider.value}ms`;
});

// Function to get current delay value from slider
function getCurrentDelay() {
  return parseInt(stepDelaySlider.value);
}

// ----------- MODAL CODE -----------

// Algorithm and priority info
const algorithmInfo = {
  title: "Search Algorithm",
  content: `<p class="mb-3">The search algorithm determines how the visualizer will explore the grid to find a path from start to goal.</p>
            <p class="font-bold mt-2">Depth-First Search (DFS):</p>
            <p class="mb-3">DFS explores as far as possible along each branch before backtracking. It prioritizes depth over breadth.</p>
            <p class="mb-1">Characteristics:</p>
            <ul class="list-disc ml-5 mb-3">
                <li>Not guaranteed to find the shortest path</li>
                <li>Uses less memory than BFS</li>
                <li>Can get stuck in deep branches</li>
                <li>Good for maze-like environments</li>
            </ul>
            
            <p class="font-bold mt-2">Breadth-First Search (BFS):</p>
            <p class="mb-3">BFS explores all nodes at the present depth level before moving on to nodes at the next depth level.</p>
            <p class="mb-1">Characteristics:</p>
            <ul class="list-disc ml-5 mb-3">
                <li>Guarantees the shortest path in terms of number of steps</li>
                <li>Uses more memory than DFS</li>
                <li>Explores in "waves" radiating from the start point</li>
                <li>Good for finding the shortest path in open environments</li>
            </ul>
            
            <p class="font-bold mt-2">A* Search (A-star):</p>
            <p class="mb-3">A* combines elements of Dijkstra's algorithm with heuristic search to find the most efficient path.</p>
            <p class="mb-1">Characteristics:</p>
            <ul class="list-disc ml-5 mb-3">
                <li>Guarantees the shortest path when using an admissible heuristic</li>
                <li>More efficient than BFS in large open spaces</li>
                <li>Uses Manhattan distance as a heuristic to estimate remaining distance</li>
                <li>Prioritizes paths that seem most promising</li>
            </ul>`,
};

const priorityInfo = {
  title: "Search Priority",
  content: `<p class="mb-3">The search priority determines how the algorithm explores the grid:</p>
            <p class="font-bold mt-2">For DFS and BFS:</p>
            <ul class="list-disc ml-5 mb-3">
                <li><strong>Top-Left First:</strong> Prioritizes up, then left, then right, then down</li>
                <li><strong>Top-Right First:</strong> Prioritizes up, then right, then left, then down</li>
                <li><strong>Bottom-Left First:</strong> Prioritizes down, then left, then right, then up</li>
                <li><strong>Bottom-Right First:</strong> Prioritizes down, then right, then left, then up</li>
            </ul>
            
            <p class="font-bold mt-2">For A* Search:</p>
            <ul class="list-disc ml-5 mb-3">
                <li><strong>Manhattan Distance:</strong> Sum of horizontal and vertical distances (taxicab geometry)</li>
                <li><strong>Euclidean Distance:</strong> Straight-line distance between two points (as the crow flies)</li>
            </ul>
            <p class="mb-3">Different heuristics can lead to different paths and efficiency in A* search.</p>`,
};

algorithmInfoIcon.addEventListener("click", (e) => {
  e.preventDefault();
  showModal(algorithmInfo.title, algorithmInfo.content);
});

priorityInfoIcon.addEventListener("click", (e) => {
  e.preventDefault();
  showModal(priorityInfo.title, priorityInfo.content);
});

// Close modal when clicking the close button or outside
closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    hideModal();
  }
});

// Modal functions
function showModal(title, content) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modal.classList.remove("hidden");
  // Close modal on escape key
  document.addEventListener("keydown", escapeKeyHandler);
}

function hideModal() {
  modal.classList.add("hidden");
  document.removeEventListener("keydown", escapeKeyHandler);
}

function escapeKeyHandler(e) {
  if (e.key === "Escape") {
    hideModal();
  }
}

// Populate algorithm selector
algorithmSelector.innerHTML = ""; // Clear existing options
const algorithms = [
  { value: "dfs", text: "Depth-First Search" },
  { value: "bfs", text: "Breadth-First Search" },
  { value: "astar", text: "A* Search" },
];

algorithms.forEach((algorithm) => {
  const option = document.createElement("option");
  option.value = algorithm.value;
  option.textContent = algorithm.text;
  algorithmSelector.appendChild(option);
});

// Define different sets of priority options
const directionPriorities = [
  { value: "topLeft", text: "Top-Left First" },
  { value: "topRight", text: "Top-Right First" },
  { value: "bottomLeft", text: "Bottom-Left First" },
  { value: "bottomRight", text: "Bottom-Right First" },
];

const astarHeuristics = [
  { value: "manhattan", text: "Manhattan Distance" },
  { value: "euclidean", text: "Euclidean Distance" },
];

// Initially populate priority selector with direction priorities
updatePriorityOptions("dfs");

// Add event listener to algorithm selector to update priority options when changed
algorithmSelector.addEventListener("change", () => {
  updatePriorityOptions(algorithmSelector.value);
});

// Function to update priority options based on selected algorithm
function updatePriorityOptions(algorithm) {
  prioritySelector.innerHTML = ""; // Clear existing options

  const options = algorithm === "astar" ? astarHeuristics : directionPriorities;

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    prioritySelector.appendChild(optionElement);
  });
}

// Add event listener to start search button
startSearchBtn.addEventListener("click", () => {
  if (searchInProgress) {
    // Stop the current search
    stopSearch();
  } else {
    // Start a new search
    const algorithm = algorithmSelector.value;
    const priority = prioritySelector.value;

    if (algorithm === "dfs") {
      depthFirstSearch(priority);
    } else if (algorithm === "bfs") {
      breadthFirstSearch(priority);
    } else if (algorithm === "astar") {
      aStarSearch(priority);
    }
  }
});

// Function to stop the current search
function stopSearch() {
  // Clear all timeouts to stop any running visualizations
  searchTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  searchTimeouts = [];

  // Reset search state
  searchInProgress = false;

  // Update button text back to "Start Search"
  updateButtonText();

  // Show toast notification
  showToast("Search stopped", true);
}

// Function to update button text based on search state
function updateButtonText() {
  if (searchInProgress) {
    startSearchBtn.textContent = "Stop";
  } else {
    startSearchBtn.textContent = "Start Search";
  }
}

// ----------- CORE SEARCH FUNCTIONS -----------

// Common search initialization and validation
function initializeSearch() {
  // Set search as in progress
  searchInProgress = true;
  updateButtonText();

  const gridState = requestGridState();
  const positions = findStartAndGoalPositions(gridState);

  // Validate positions
  if (!positions.startPos) {
    showToast("Please add a start position!");
    searchInProgress = false;
    updateButtonText();
    return null;
  }

  if (!positions.goalPos) {
    showToast("Please add a goal position!");
    searchInProgress = false;
    updateButtonText();
    return null;
  }

  resetVisited();
  return { gridState, ...positions };
}

// Find start and goal positions in the grid
function findStartAndGoalPositions(gridState) {
  let startPos = null;
  let goalPos = null;

  for (let i = 0; i < gridState.length; i++) {
    for (let j = 0; j < gridState[i].length; j++) {
      if (gridState[i][j] === "start") {
        startPos = { row: i, col: j };
      } else if (gridState[i][j] === "goal") {
        goalPos = { row: i, col: j };
      }
    }
  }

  return { startPos, goalPos };
}

// Common completion handler for all algorithms
function handleSearchCompletion(found, path, goalPos) {
  if (found) {
    visualizePath(path, goalPos);
  } else {
    showToast("No path found to goal!");
    searchInProgress = false;
    updateButtonText();
  }
}

// Visualize a visited cell (common across all algorithms)
function visualizeVisitedCell(row, col, gridState) {
  const currCell = gridState[row][col];
  if (currCell !== "start" && currCell !== "goal") {
    const cell = grid.children[row].children[col];
    // Remove existing background classes and add search-visited class with animation
    cell.className = cell.className.replace(/bg-\S+/g, "");
    cell.classList.add("search-visited", "animate-show");
  }
}

// Check if position is valid and not a wall
function isValidPosition(row, col, gridState, visited) {
  return (
    row >= 0 &&
    row < gridState.length &&
    col >= 0 &&
    col < gridState[0].length &&
    !visited.has(`${row}-${col}`) &&
    gridState[row][col] !== "wall"
  );
}

// Get neighbors for a position
function getValidNeighbors(current, gridState, visited, directions) {
  const neighbors = [];
  const currentKey = `${current.row}-${current.col}`;

  for (const dir of directions) {
    const newRow = current.row + dir.row;
    const newCol = current.col + dir.col;

    if (isValidPosition(newRow, newCol, gridState, visited)) {
      neighbors.push({
        position: { row: newRow, col: newCol },
        key: `${newRow}-${newCol}`,
        parentKey: currentKey,
      });
    }
  }

  return neighbors;
}

// ----------- ALGORITHM IMPLEMENTATIONS -----------

// DFS implementation
function depthFirstSearch(priority) {
  const searchData = initializeSearch();
  if (!searchData) return;

  const { gridState, startPos, goalPos } = searchData;
  const visited = new Set();
  const stack = [startPos];
  const path = new Map();
  let found = false;
  const directions = getDirections(priority);

  const dfsStep = () => {
    if (stack.length === 0 || found) {
      handleSearchCompletion(found, path, goalPos);
      return;
    }

    const current = stack.pop();
    const key = `${current.row}-${current.col}`;

    if (visited.has(key)) {
      setTimeout(dfsStep, getCurrentDelay());
      return;
    }

    visited.add(key);
    visualizeVisitedCell(current.row, current.col, gridState);

    // Check if goal is reached
    if (current.row === goalPos.row && current.col === goalPos.col) {
      found = true;
      setTimeout(dfsStep, getCurrentDelay());
      return;
    }

    // Add neighbors to stack in reverse order (LIFO nature of stack)
    const neighbors = getValidNeighbors(
      current,
      gridState,
      visited,
      directions
    );
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      stack.push(neighbor.position);
      path.set(neighbor.key, neighbor.parentKey);
    }

    const timeoutId = setTimeout(dfsStep, getCurrentDelay());
    searchTimeouts.push(timeoutId);
  };

  dfsStep();
}

// BFS implementation
function breadthFirstSearch(priority) {
  const searchData = initializeSearch();
  if (!searchData) return;

  const { gridState, startPos, goalPos } = searchData;
  const visited = new Set();
  const queue = [startPos];
  const path = new Map();
  let found = false;
  const directions = getDirections(priority);

  // Mark start as visited immediately
  visited.add(`${startPos.row}-${startPos.col}`);

  const bfsStep = () => {
    if (queue.length === 0 || found) {
      handleSearchCompletion(found, path, goalPos);
      return;
    }

    const current = queue.shift(); // Dequeue from front (FIFO)
    visualizeVisitedCell(current.row, current.col, gridState);

    // Check if goal is reached
    if (current.row === goalPos.row && current.col === goalPos.col) {
      found = true;
      setTimeout(bfsStep, getCurrentDelay());
      return;
    }

    // Add neighbors to queue
    const neighbors = getValidNeighbors(
      current,
      gridState,
      new Set(),
      directions
    );
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.key)) {
        visited.add(neighbor.key);
        queue.push(neighbor.position);
        path.set(neighbor.key, neighbor.parentKey);
      }
    }

    const timeoutId = setTimeout(bfsStep, getCurrentDelay());
    searchTimeouts.push(timeoutId);
  };

  bfsStep();
}

// A* search implementation
function aStarSearch(heuristicType) {
  const searchData = initializeSearch();
  if (!searchData) return;

  const { gridState, startPos, goalPos } = searchData;
  const openSet = new PriorityQueue();
  const closedSet = new Set();
  const gScore = new Map();
  const fScore = new Map();
  const path = new Map();
  let found = false;

  // Choose heuristic function
  const calculateHeuristic =
    heuristicType === "euclidean" ? euclideanHeuristic : manhattanHeuristic;

  // Initialize scores
  const startKey = `${startPos.row}-${startPos.col}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, calculateHeuristic(startPos, goalPos));

  // Add start to open set
  openSet.enqueue(startPos, fScore.get(startKey));

  // Standard directions for A*
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  const aStarStep = () => {
    if (openSet.isEmpty() || found) {
      handleSearchCompletion(found, path, goalPos);
      return;
    }

    const current = openSet.dequeue().value;
    const key = `${current.row}-${current.col}`;

    // Check if goal is reached
    if (current.row === goalPos.row && current.col === goalPos.col) {
      found = true;
      setTimeout(aStarStep, getCurrentDelay());
      return;
    }

    closedSet.add(key);
    visualizeVisitedCell(current.row, current.col, gridState);

    // Process neighbors
    for (const dir of directions) {
      const neighbor = {
        row: current.row + dir.row,
        col: current.col + dir.col,
      };

      if (
        neighbor.row >= 0 &&
        neighbor.row < gridState.length &&
        neighbor.col >= 0 &&
        neighbor.col < gridState[0].length
      ) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;

        // Skip if in closed set or is a wall
        if (
          closedSet.has(neighborKey) ||
          gridState[neighbor.row][neighbor.col] === "wall"
        ) {
          continue;
        }

        const tentativeGScore = gScore.get(key) + 1;

        // If neighbor not in open set or new path is better
        if (
          !gScore.has(neighborKey) ||
          tentativeGScore < gScore.get(neighborKey)
        ) {
          path.set(neighborKey, key);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(
            neighborKey,
            tentativeGScore + calculateHeuristic(neighbor, goalPos)
          );

          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(neighborKey));
          }
        }
      }
    }

    const timeoutId = setTimeout(aStarStep, getCurrentDelay());
    searchTimeouts.push(timeoutId);
  };

  aStarStep();
}

// ----------- HELPER FUNCTIONS -----------

// Manhattan distance heuristic for A*
function manhattanHeuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Euclidean distance heuristic for A*
function euclideanHeuristic(a, b) {
  return Math.sqrt(Math.pow(a.row - b.row, 2) + Math.pow(a.col - b.col, 2));
}

// Get directions based on priority
function getDirections(priority) {
  switch (priority) {
    case "topLeft":
      return [
        { row: -1, col: 0 }, // Up
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }, // Right
        { row: 1, col: 0 }, // Down
      ];
    case "topRight":
      return [
        { row: -1, col: 0 }, // Up
        { row: 0, col: 1 }, // Right
        { row: 0, col: -1 }, // Left
        { row: 1, col: 0 }, // Down
      ];
    case "bottomLeft":
      return [
        { row: 1, col: 0 }, // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }, // Right
        { row: -1, col: 0 }, // Up
      ];
    case "bottomRight":
      return [
        { row: 1, col: 0 }, // Down
        { row: 0, col: 1 }, // Right
        { row: 0, col: -1 }, // Left
        { row: -1, col: 0 }, // Up
      ];
    default:
      return [
        { row: -1, col: 0 }, // Up
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }, // Right
        { row: 1, col: 0 }, // Down
      ];
  }
}

// Reset all visited cells
function resetVisited() {
  resetVisuals();
}

// Visualize the path from start to goal
function visualizePath(path, goal) {
  let current = `${goal.row}-${goal.col}`;
  const pathCells = [];

  // Construct the path
  while (path.has(current)) {
    const [row, col] = current.split("-").map(Number);
    pathCells.push({ row, col });
    current = path.get(current);
  }

  // Visualize path (except start and goal)
  const gridState = requestGridState();
  for (let i = 0; i < pathCells.length; i++) {
    const timeoutId = setTimeout(() => {
      const { row, col } = pathCells[pathCells.length - 1 - i];
      if (gridState[row][col] !== "start" && gridState[row][col] !== "goal") {
        const cell = grid.children[row].children[col];
        // Remove existing background classes and add search-path class with animation
        cell.className = cell.className.replace(/bg-\S+/g, "");
        cell.className = cell.className.replace(/search-visited/g, "");
        cell.className = cell.className.replace(/animate-show/g, "");
        cell.style.animation = "none";
        cell.offsetHeight; // force reflow
        cell.style.animation = ""; // or reassign the animation name if needed
        cell.classList.add("search-path", "animate-show");
      }
    }, i * getCurrentDelay());

    searchTimeouts.push(timeoutId);
  }

  const finalTimeoutId = setTimeout(() => {
    if (searchInProgress) {
      showToast(`Path found!`, true);
      searchInProgress = false;
      updateButtonText();
    }
  }, pathCells.length * getCurrentDelay());

  searchTimeouts.push(finalTimeoutId);
}

// Show toast notification
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

// ----------- DATA STRUCTURES -----------

// Priority Queue implementation for A* search
class PriorityQueue {
  constructor() {
    this.items = [];
    this.itemSet = new Set(); // For quick contains check
  }

  enqueue(value, priority) {
    const key = `${value.row}-${value.col}`;

    // If item already in queue, remove it first (will be re-added with new priority)
    if (this.contains(value)) {
      this.items = this.items.filter(
        (item) => item.value.row !== value.row || item.value.col !== value.col
      );
      this.itemSet.delete(key);
    }

    // Add new item
    this.items.push({ value, priority });
    this.itemSet.add(key);

    // Sort by priority (lowest first)
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items.shift();
    this.itemSet.delete(`${item.value.row}-${item.value.col}`);
    return item;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  contains(value) {
    return this.itemSet.has(`${value.row}-${value.col}`);
  }
}
