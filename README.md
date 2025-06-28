# Search Algorithms Visualized 🔍

An interactive web application written with pure Vanilla Javascript (except for Toastify) that visualizes popular pathfinding and search algorithms in real-time. 

[Check out the demo!](https://search-algorithms-visualized.netlify.app/)

![Screenshot from the application](https://github.com/user-attachments/assets/a5424448-91ab-4cbc-afc8-82aa2e6db2f3)


## Features

### Search Algorithms
- **Depth-First Search (DFS)** - Explores as deep as possible before backtracking
- **Breadth-First Search (BFS)** - Explores level by level, guaranteeing shortest path
- **A* Search** - Intelligent pathfinding using heuristics for optimal efficiency

### Customization Options
- **Grid Size Control** - Adjustable grid dimensions (1x1 to 50x50)
- **Search Priority** - Choose exploration direction preferences:
  - Top-Left First
  - Top-Right First  
  - Bottom-Left First
  - Bottom-Right First
- **Animation Speed** - Adjustable delay between steps (1ms to 1000ms)
- **Interactive Grid Editing** - Click to place walls, start, and goal positions

### Templates
- **Empty Grid** - Clean slate for custom maze creation
- **Random Labyrinth** - Procedurally generated maze patterns

### Visual Elements
- Real-time pathfinding visualization
- Color-coded tiles (Empty, Wall, Start, Goal, Visited, Path)
- Step-by-step algorithm execution
- Interactive controls and settings

## How to Use

1. **Set up the grid:**
   - Choose your desired grid size
   - Select start (green) and goal (orange) positions
   - Add walls (black) to create obstacles

2. **Configure the search:**
   - Pick your preferred search algorithm
   - Set the search priority direction
   - Adjust animation speed with the delay slider

3. **Run the visualization:**
   - Click "Start Search" to begin
   - Watch the algorithm explore the grid in real-time
   - Reset and try different configurations

## Technologies Used

- **HTML5** - Semantic structure and accessibility
- **CSS3** - Styling with Tailwind CSS framework
- **Vanilla JavaScript** - Modular ES6+ implementation
- **Font Awesome** - Icon library for UI elements
- **Toastify.js** - Toast notifications for user feedback

## Project Structure

```
search_algorithms_visualized/
├── index.html              # Main HTML structure
├── main.js                 # Entry point and module imports
├── gridHandler.js          # Grid creation and management
├── searchSettingsHandler.js # Algorithm implementations
├── tileSelectorHandler.js  # Tile interaction logic
├── templateHandler.js      # Template loading functionality
├── style.css              # Custom styling
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- A modern web browser with ES6+ support
- No installation required - runs entirely in the browser

### Running the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/search_algorithms_visualized.git
   cd search_algorithms_visualized
   ```

2. **Open in browser:**
   - Simply open `index.html` in your web browser
   - Or serve locally using a development server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   # Right-click index.html → "Open with Live Server"
   ```

3. **Start visualizing:**
   - Navigate to `http://localhost:8000` (if using local server)
   - Begin creating grids and exploring algorithms!

##  Educational Value

This project is perfect for:
- **Computer Science Students** learning about search algorithms
- **Educators** teaching algorithmic concepts visually
- **Developers** understanding pathfinding implementations
- **Anyone curious** about how navigation systems work

---

**Made with ❤️ by [Starosti](https://github.com/Starosti/)**
