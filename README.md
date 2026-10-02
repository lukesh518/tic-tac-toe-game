# 🎮 Ultimate Tic-Tac-Toe Game

A modern, highly polished, fully functional **Tic-Tac-Toe** web application built with **pure HTML5, CSS3, and Vanilla JavaScript**.

![Tic-Tac-Toe Game Banner](https://img.shields.io/badge/Game-Tic--Tac--Toe-00f2fe?style=for-the-badge&logo=gamepad)
![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript-ff007f?style=for-the-badge)

---

## ✨ Features

- 👥 **Game Modes**:
  - **Player vs Player (Local)**: Play against a friend on the same device.
  - **Player vs AI**: Play against an intelligent computer bot.
- 🧠 **3 AI Difficulty Levels**:
  - **Easy**: Random move generator.
  - **Medium**: Balanced tactical blocking and random moves.
  - **Unbeatable (Hard)**: Powered by the **Minimax Algorithm** — mathematically impossible to beat!
- 📐 **Grid Sizes**:
  - **3 × 3 Classic**: Get 3 in a row to win.
  - **4 × 4 Advanced**: Get 4 in a row to win on an expanded board.
- 🎨 **Visual Themes**:
  - 🌌 **Neon Dark**: Cyberpunk glow effects with vibrant cyan and magenta highlights.
  - ☀️ **Light Glass**: Clean glassmorphism aesthetic with soft ambient blurs.
  - 🌅 **Sunset Glow**: Warm twilight gradients with soft golden tones.
- 🔊 **Synthesized Web Audio API**:
  - Pure JavaScript sound effects without any external `.mp3` dependencies.
  - Dynamic tones for placement, victory chords, draw sounds, and button clicks.
  - Mute/Unmute toggle button.
- 🎆 **Animations & Visual Effects**:
  - Dynamic SVG strike-through line animating across the winning combination.
  - Particle physics canvas confetti explosion upon victory.
  - Smooth cell pop-ins and turn highlights.
- 🕹️ **Game Controls & Persistence**:
  - **Undo Move**: Backtrack your moves anytime.
  - **Scoreboard**: Tracks Player X wins, Player O/AI wins, and Draws using `localStorage`.
  - **Keyboard Navigation**: Full arrow key support with <kbd>Enter</kbd> / <kbd>Space</kbd> to mark, <kbd>R</kbd> to Restart, <kbd>U</kbd> to Undo, and <kbd>M</kbd> to Mute.

---

## 📁 Project Structure

```text
tic-tac-toe-game/
├── index.html   # Main HTML structure, layout, and modal UI
├── style.css    # Responsive CSS Grid, themes, animations & glassmorphism
├── script.js    # Game logic, Minimax AI, audio synth, SVG lines & confetti
└── README.md    # Documentation and usage guide
```

---

## 🚀 How to Run the Game Locally

No external build tools, bundlers, or servers are required!

### Option 1: Direct File Opening
1. Clone or download this repository.
2. Double-click `index.html` to open it in any web browser (Chrome, Firefox, Edge, Safari).

### Option 2: Live Server (VS Code Extension / Local HTTP Server)
1. Open the project folder in VS Code.
2. Right-click `index.html` and select **Open with Live Server**, or run a local HTTP server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

---

## 🎮 How to Play

1. Select your desired **Mode** (vs AI or 2 Players).
2. Choose a **Difficulty** if playing against the AI.
3. Select your preferred **Grid Size** (3x3 or 4x4) and **Theme**.
4. Take turns clicking on empty board cells (or using **Arrow Keys** + **Enter**).
5. Align 3 (or 4 in 4x4 mode) of your marks horizontally, vertically, or diagonally to win!

### ⌨️ Keyboard Shortcuts
- <kbd>Arrow Keys</kbd>: Navigate through board cells
- <kbd>Enter</kbd> / <kbd>Space</kbd>: Place mark on focused cell
- <kbd>R</kbd>: Start a New Round
- <kbd>U</kbd>: Undo last move
- <kbd>M</kbd>: Toggle Sound ON / OFF

---

## 📦 How to Push to GitHub

To push this repository to your GitHub account, follow these commands:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files to staging
git add .

# 3. Commit the changes
git commit -m "feat: Initial commit for Ultimate Tic-Tac-Toe game"

# 4. Create a main branch
git branch -M main

# 5. Add your GitHub remote repository (replace with your GitHub username & repo name)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/tic-tac-toe-game.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📜 License
This project is open-source under the **MIT License**. Feel free to customize and expand!
