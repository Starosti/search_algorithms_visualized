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
const algorithmInfoIcon = document.querySelector('label[for="algorithm"] + div a');
const priorityInfoIcon = document.querySelector('label[for="priority"] + div a');

// ----------- GRID CHANGE LISTENER -----------

// Listen for grid changes and reset visualizations
document.addEventListener('gridChanged', () => {
  // Clear all timeouts to stop any running visualizations
  searchTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  searchTimeouts = [];
  
  // Reset search state
  searchInProgress = false;
  
  // Use the resetVisuals function to ensure correct visual state
  resetVisuals();
  
  console.log("Grid changed - visualization reset");
});

// ----------- SLIDER CODE -----------

// Update the delay value display when the slider changes
stepDelaySlider.addEventListener('input', () => {
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
            </ul>`
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
            <p class="mb-3">Different heuristics can lead to different paths and efficiency in A* search.</p>`
};

algorithmInfoIcon.addEventListener('click', (e) => {
  e.preventDefault();
  showModal(algorithmInfo.title, algorithmInfo.content);
});

priorityInfoIcon.addEventListener('click', (e) => {
  e.preventDefault();
  showModal(priorityInfo.title, priorityInfo.content);
});

// Close modal when clicking the close button or outside
closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    hideModal();
  }
});

// Modal functions
function showModal(title, content) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modal.classList.remove('hidden');
  // Close modal on escape key
  document.addEventListener('keydown', escapeKeyHandler);
}

function hideModal() {
  modal.classList.add('hidden');
  document.removeEventListener('keydown', escapeKeyHandler);
}

function escapeKeyHandler(e) {
  if (e.key === 'Escape') {
    hideModal();
  }
}

// Populate algorithm selector
algorithmSelector.innerHTML = ""; // Clear existing options
const algorithms = [
  { value: "dfs", text: "Depth-First Search" },
  { value: "bfs", text: "Breadth-First Search" },
  { value: "astar", text: "A* Search" }
];

algorithms.forEach(algorithm => {
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
  { value: "bottomRight", text: "Bottom-Right First" }
];

const astarHeuristics = [
  { value: "manhattan", text: "Manhattan Distance" },
  { value: "euclidean", text: "Euclidean Distance" }
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
  
  options.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    prioritySelector.appendChild(optionElement);
  });
}

// Add event listener to start search button
startSearchBtn.addEventListener("click", () => {
  const algorithm = algorithmSelector.value;
  const priority = prioritySelector.value;
  
  if (algorithm === "dfs") {
    depthFirstSearch(priority);
  } else if (algorithm === "bfs") {
    breadthFirstSearch(priority);
  } else if (algorithm === "astar") {
    aStarSearch(priority);
  }
});

// ----------- DFS -----------

// DFS implementation
function depthFirstSearch(priority) {
  // Set search as in progress
  searchInProgress = true;
  
  const gridState = requestGridState();
  
  // Find start and goal positions
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
  
  // Check if start and goal exist
  if (!startPos) {
    showToast("Please add a start position!");
    return;
  }
  
  if (!goalPos) {
    showToast("Please add a goal position!");
    return;
  }
  
  // Reset all visited states
  resetVisited();
  
  // Run DFS
  const visited = new Set();
  const stack = [startPos];
  const path = new Map();
  let found = false;
  
  // Direction order based on priority
  const directions = getDirections(priority);
  
   let step = 0;
   const dfsStep = () => {
    if (stack.length === 0 || found) {
      if (found) {
        visualizePath(path, goalPos);
      } else {
        showToast("No path found to goal!");
      }
      searchInProgress = false;
      return;
    }
    
    const current = stack.pop();
    const key = `${current.row}-${current.col}`;
    if (visited.has(key)) {
        setTimeout(dfsStep, getCurrentDelay());
        return;
    }
    
    visited.add(key);
    
    // Visualize visited cell
    const currCell = gridState[current.row][current.col]
    if (currCell !== "start" && currCell !== "goal" ) {
      const cell = grid.children[current.row].children[current.col];
      cell.style.backgroundColor = "#90cdf4"; // Light blue for visited
    }
    // Check if goal is reached
      if (current.row === goalPos.row && current.col === goalPos.col) {
        found = true;
        setTimeout(dfsStep, getCurrentDelay());
        return;
      }
    
    // Add neighbors to stack based on priority
    // For DFS, we need to add in reverse order due to LIFO nature of stack
    for (let i = directions.length - 1; i >= 0; i--) {
      const dir = directions[i];
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col; 
      // Check if valid position
      if (newRow >= 0 && newRow < gridState.length && 
          newCol >= 0 && newCol < gridState[0].length) {
        
        const newKey = `${newRow}-${newCol}`;
        
        // Check if not visited and not wall
        if (!visited.has(newKey) && gridState[newRow][newCol] !== "wall") {
          stack.push({ row: newRow, col: newCol });
          path.set(newKey, key); // Store the path
        }
      }
    }
    step++;
    // Register timeout with our tracking array using the current delay from slider
    const timeoutId = setTimeout(dfsStep, getCurrentDelay());
    searchTimeouts.push(timeoutId);
  };
  
  // Start DFS
  dfsStep();
}

// ----------- BFS -----------

// BFS implementation
function breadthFirstSearch(priority) {
  // Set search as in progress
  searchInProgress = true;
  
  const gridState = requestGridState();
  
  // Find start and goal positions
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
  
  // Check if start and goal exist
  if (!startPos) {
    showToast("Please add a start position!");
    return;
  }
  
  if (!goalPos) {
    showToast("Please add a goal position!");
    return;
  }
  
  // Reset all visited states
  resetVisited();
  
  // Run BFS
  const visited = new Set();
  const queue = [startPos]; // Use queue for BFS instead of stack
  const path = new Map();
  let found = false;
  
  // Mark start as visited immediately
  visited.add(`${startPos.row}-${startPos.col}`);
  
  // Direction order based on priority
  const directions = getDirections(priority);    
  const bfsStep = () => {
      if (queue.length === 0 || found) {
        if (found) {
          visualizePath(path, goalPos);
        } else {
          showToast("No path found to goal!");
        }
        searchInProgress = false;
        return;
      }
    
    const current = queue.shift(); // Dequeue from front (FIFO)
    const key = `${current.row}-${current.col}`;
    
    const currCell = gridState[current.row][current.col]
    if (currCell !== "start" && currCell !== "goal" ) {
      const cell = grid.children[current.row].children[current.col];
      cell.style.backgroundColor = "#90cdf4"; // Light blue for visited
    }      // Check if goal is reached
      if (current.row === goalPos.row && current.col === goalPos.col) {
        found = true;
        setTimeout(bfsStep, getCurrentDelay());
        return;
      }
    
    // Add neighbors to queue based on priority
    for (const dir of directions) {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;
      
      // Check if valid position
      if (newRow >= 0 && newRow < gridState.length && 
          newCol >= 0 && newCol < gridState[0].length) {
        
        const newKey = `${newRow}-${newCol}`;
        
        // Check if not visited and not wall
        if (!visited.has(newKey) && gridState[newRow][newCol] !== "wall") {
          visited.add(newKey); // Mark as visited immediately to avoid duplicates
          queue.push({ row: newRow, col: newCol });
          path.set(newKey, key); // Store the path
        }
      }
    }      // Register timeout with our tracking array using the current delay from slider
      const timeoutId = setTimeout(bfsStep, getCurrentDelay());
      searchTimeouts.push(timeoutId);
    };
  
  // Start BFS
  bfsStep();
}

// ----------- A* (A-STAR) SEARCH -----------

// A* search implementation
function aStarSearch(heuristicType) {
  // Set search as in progress
  searchInProgress = true;
  
  const gridState = requestGridState();
  
  // Find start and goal positions
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
  
  // Check if start and goal exist
  if (!startPos) {
    showToast("Please add a start position!");
    return;
  }
  
  if (!goalPos) {
    showToast("Please add a goal position!");
    return;
  }
  
  // Reset all visited states
  resetVisited();
  
  // A* specific data structures
  const openSet = new PriorityQueue();
  const closedSet = new Set();
  const gScore = new Map(); // Cost from start to current node
  const fScore = new Map(); // gScore + heuristic (estimated cost to goal)
  const path = new Map();
  
  // Choose the heuristic function based on the selected type
  const calculateHeuristic = heuristicType === "euclidean" 
    ? euclideanHeuristic 
    : manhattanHeuristic;
  
  // Initialize scores
  const startKey = `${startPos.row}-${startPos.col}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, calculateHeuristic(startPos, goalPos));
  
  // Add start to open set
  openSet.enqueue(startPos, fScore.get(startKey));
  
  let found = false;
  // Use all directions for A* - doesn't matter as much for path finding
  const directions = [
    { row: -1, col: 0 },  // Up
    { row: 1, col: 0 },   // Down
    { row: 0, col: -1 },  // Left
    { row: 0, col: 1 },   // Right
  ];    const aStarStep = () => {
      if (openSet.isEmpty() || found) {
        if (found) {
          visualizePath(path, goalPos);
        } else {
          showToast("No path found to goal!");
        }
        searchInProgress = false;
        return;
      }
    
    // Get node with lowest f-score from open set
    const current = openSet.dequeue().value;
    const key = `${current.row}-${current.col}`;      // Check if goal is reached
      if (current.row === goalPos.row && current.col === goalPos.col) {
        found = true;
        setTimeout(aStarStep, getCurrentDelay());
        return;
      }
    
    closedSet.add(key);
    
    // Visualize visited cell
    if (gridState[current.row][current.col] !== "start" && gridState[current.row][current.col] !== "goal") {
      const cell = grid.children[current.row].children[current.col];
      cell.style.backgroundColor = "#90cdf4"; // Light blue for visited
    }
    
    // Check all neighbors
    for (const dir of directions) {
      const neighbor = {
        row: current.row + dir.row,
        col: current.col + dir.col
      };
      
      // Check if valid position
      if (neighbor.row >= 0 && neighbor.row < gridState.length && 
          neighbor.col >= 0 && neighbor.col < gridState[0].length) {
        
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        
        // Skip if in closed set or is a wall
        if (closedSet.has(neighborKey) || gridState[neighbor.row][neighbor.col] === "wall") {
          continue;
        }
        
        // Calculate tentative g-score
        const tentativeGScore = gScore.get(key) + 1; // Uniform cost of 1 per step
        
        // If neighbor not in open set or new path is better
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          // Record path
          path.set(neighborKey, key);
          
          // Update scores using the selected heuristic
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + calculateHeuristic(neighbor, goalPos));
          
          // Add to open set if not there
          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(neighborKey));
          }
        }
      }
    }      // Register timeout for next step
      const timeoutId = setTimeout(aStarStep, getCurrentDelay());
      searchTimeouts.push(timeoutId);
    };
  
  // Start A* search
  aStarStep();
}

// Manhattan distance heuristic for A*
function manhattanHeuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Euclidean distance heuristic for A*
function euclideanHeuristic(a, b) {
  return Math.sqrt(
    Math.pow(a.row - b.row, 2) + Math.pow(a.col - b.col, 2)
  );
}

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
      this.items = this.items.filter(item => 
        item.value.row !== value.row || item.value.col !== value.col
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

// Get directions based on priority
function getDirections(priority) {
  // Directions: [row, col]
  switch (priority) {
    case "topLeft":
      return [
        { row: -1, col: 0 },  // Up
        { row: 0, col: -1 },  // Left
        { row: 0, col: 1 },   // Right
        { row: 1, col: 0 }    // Down
      ];
    case "topRight":
      return [
        { row: -1, col: 0 },  // Up
        { row: 0, col: 1 },   // Right
        { row: 0, col: -1 },  // Left
        { row: 1, col: 0 }    // Down
      ];
    case "bottomLeft":
      return [
        { row: 1, col: 0 },   // Down
        { row: 0, col: -1 },  // Left
        { row: 0, col: 1 },   // Right
        { row: -1, col: 0 }   // Up
      ];
    case "bottomRight":
      return [
        { row: 1, col: 0 },   // Down
        { row: 0, col: 1 },   // Right
        { row: 0, col: -1 },  // Left
        { row: -1, col: 0 }   // Up
      ];
    default:
      return [
        { row: -1, col: 0 },  // Up
        { row: 0, col: -1 },  // Left
        { row: 0, col: 1 },   // Right
        { row: 1, col: 0 }    // Down
      ];
  }
}

// Reset all visited cells
function resetVisited() {
  // Use the resetVisuals function instead of manually resetting
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
        cell.style.backgroundColor = "#38b246"; // Teal for path
      }
    }, i * getCurrentDelay()); // Use current delay from slider
    
    searchTimeouts.push(timeoutId);
  }
  
  const finalTimeoutId = setTimeout(() => {
    if (searchInProgress) {
      showToast(`Path found!`, true);
      searchInProgress = false;
    }
  }, pathCells.length * getCurrentDelay()); // Use current delay from slider
  
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
