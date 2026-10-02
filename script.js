/**
 * Ultimate Tic-Tac-Toe Game Engine
 * Features: PvP & PvE, Easy/Medium/Minimax AI, 3x3 & 4x4 grids,
 * Web Audio API synthesized sounds, canvas confetti, SVG winning lines, keyboard support.
 */

function startApp() {
    // --- Safe Storage Helpers ---
    function getStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function setStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Ignore storage restrictions
        }
    }

    // --- DOM Elements ---
    const boardEl = document.getElementById('board');
    const statusBarEl = document.getElementById('status-bar');
    const statusTextEl = document.getElementById('status-text');
    const modeSelectEl = document.getElementById('mode-select');
    const difficultySelectEl = document.getElementById('difficulty-select');
    const difficultyGroupEl = document.getElementById('difficulty-group');
    const gridSelectEl = document.getElementById('grid-select');
    const themeSelectEl = document.getElementById('theme-select');
    const scoreXEl = document.getElementById('score-x');
    const scoreOEl = document.getElementById('score-o');
    const scoreDrawEl = document.getElementById('score-draw');
    const labelPlayerXEl = document.getElementById('label-player-x');
    const labelPlayerOEl = document.getElementById('label-player-o');
    const scoreCardXEl = document.getElementById('score-card-x');
    const scoreCardOEl = document.getElementById('score-card-o');

    const btnRestart = document.getElementById('btn-restart');
    const btnUndo = document.getElementById('btn-undo');
    const btnResetScores = document.getElementById('btn-reset-scores');
    const btnSound = document.getElementById('btn-sound');
    const soundIconEl = document.getElementById('sound-icon');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalBtnPlayAgain = document.getElementById('modal-btn-play-again');

    const winningLineSvg = document.getElementById('winning-line-svg');
    const winningLine = document.getElementById('winning-line');
    const confettiCanvas = document.getElementById('confetti-canvas');

    // --- State Variables ---
    let gridSize = parseInt(gridSelectEl.value, 10);
    let boardState = Array(gridSize * gridSize).fill('');
    let currentPlayer = 'X';
    let isGameOver = false;
    let mode = modeSelectEl.value; // 'pvp' or 'pve'
    let difficulty = difficultySelectEl.value; // 'easy', 'medium', 'hard'
    let moveHistory = []; // stack of { index, player }
    let focusedCellIndex = 0;
    let soundEnabled = true;
    let confettiAnimationId = null;
    let audioCtx = null;

    // Scores
    let scores = { X: 0, O: 0, draws: 0 };

    // --- Load Saved Preferences & Scores ---
    loadPreferences();
    updateScoreboardDisplay();
    initGame();

    // ==========================================================================
    // Initialization & Event Listeners
    // ==========================================================================

    function loadPreferences() {
        const savedScores = getStorage('tictactoe_scores');
        if (savedScores) {
            try { scores = JSON.parse(savedScores); } catch (e) {}
        }
        const savedSound = getStorage('tictactoe_sound');
        if (savedSound !== null) {
            soundEnabled = savedSound === 'true';
            updateSoundIcon();
        }
        const savedTheme = getStorage('tictactoe_theme');
        if (savedTheme) {
            themeSelectEl.value = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    function initGame() {
        boardState = Array(gridSize * gridSize).fill('');
        currentPlayer = 'X';
        isGameOver = false;
        moveHistory = [];
        focusedCellIndex = 0;

        hideModal();
        clearWinningLine();
        stopConfetti();

        btnUndo.disabled = true;
        boardEl.setAttribute('data-grid', gridSize);

        renderBoard();
        updateTurnDisplay();
        updateLabels();
    }

    function renderBoard() {
        boardEl.innerHTML = '';
        const totalCells = gridSize * gridSize;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('tabindex', i === focusedCellIndex ? '0' : '-1');
            cell.setAttribute('aria-label', `Cell ${i + 1}, Empty`);

            cell.addEventListener('click', () => handleCellClick(i));
            cell.addEventListener('keydown', (e) => handleCellKeyDown(e, i));

            boardEl.appendChild(cell);
        }
    }

    // ==========================================================================
    // Event Handlers (Controls & Mode Switching)
    // ==========================================================================

    modeSelectEl.addEventListener('change', () => {
        playSound('click');
        mode = modeSelectEl.value;
        difficultyGroupEl.style.display = mode === 'pve' ? 'flex' : 'none';
        updateLabels();
        initGame();
    });

    difficultySelectEl.addEventListener('change', () => {
        playSound('click');
        difficulty = difficultySelectEl.value;
        initGame();
    });

    gridSelectEl.addEventListener('change', () => {
        playSound('click');
        gridSize = parseInt(gridSelectEl.value, 10);
        initGame();
    });

    themeSelectEl.addEventListener('change', () => {
        playSound('click');
        const theme = themeSelectEl.value;
        document.documentElement.setAttribute('data-theme', theme);
        setStorage('tictactoe_theme', theme);
    });

    btnRestart.addEventListener('click', () => {
        playSound('click');
        initGame();
    });

    btnUndo.addEventListener('click', () => {
        undoMove();
    });

    btnResetScores.addEventListener('click', () => {
        playSound('click');
        scores = { X: 0, O: 0, draws: 0 };
        setStorage('tictactoe_scores', JSON.stringify(scores));
        updateScoreboardDisplay();
    });

    btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        setStorage('tictactoe_sound', soundEnabled);
        updateSoundIcon();
        if (soundEnabled) playSound('click');
    });

    modalBtnPlayAgain.addEventListener('click', () => {
        playSound('click');
        initGame();
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

        if (e.key.toLowerCase() === 'r') {
            initGame();
        } else if (e.key.toLowerCase() === 'u') {
            undoMove();
        } else if (e.key.toLowerCase() === 'm') {
            btnSound.click();
        }
    });

    // ==========================================================================
    // Core Game Play Logic
    // ==========================================================================

    function handleCellClick(index) {
        if (isGameOver || boardState[index] !== '') return;
        if (mode === 'pve' && currentPlayer === 'O') return; // AI is thinking

        makeMove(index, currentPlayer);

        // Check state after Human player move
        if (checkGameStatus()) return;

        // If PvE mode, schedule AI move
        if (mode === 'pve' && !isGameOver && currentPlayer === 'O') {
            disableBoardInteraction(true);
            setTimeout(() => {
                const aiIndex = getAIMove();
                if (aiIndex !== -1 && aiIndex !== undefined) {
                    makeMove(aiIndex, 'O');
                    checkGameStatus();
                }
                disableBoardInteraction(false);
            }, 400);
        }
    }

    function makeMove(index, player) {
        boardState[index] = player;
        moveHistory.push({ index, player });

        const cell = boardEl.children[index];
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.setAttribute('aria-label', `Cell ${index + 1}, Marked with ${player}`);
        cell.disabled = true;

        playSound(player === 'X' ? 'moveX' : 'moveO');

        btnUndo.disabled = false;

        // Switch turn
        currentPlayer = player === 'X' ? 'O' : 'X';
        updateTurnDisplay();
    }

    function undoMove() {
        if (moveHistory.length === 0 || isGameOver) return;

        playSound('click');

        // In PvE mode, undo 2 moves (AI + Human) unless AI hasn't moved
        let movesToUndo = (mode === 'pve' && moveHistory.length >= 2) ? 2 : 1;

        for (let i = 0; i < movesToUndo; i++) {
            if (moveHistory.length === 0) break;
            const lastMove = moveHistory.pop();
            boardState[lastMove.index] = '';

            const cell = boardEl.children[lastMove.index];
            cell.textContent = '';
            cell.className = 'cell';
            cell.removeAttribute('aria-label');
            cell.disabled = false;
        }

        currentPlayer = 'X';
        isGameOver = false;
        clearWinningLine();
        hideModal();
        stopConfetti();

        if (moveHistory.length === 0) {
            btnUndo.disabled = true;
        }

        updateTurnDisplay();
    }

    function checkGameStatus() {
        const winningCombo = getWinningCombination(boardState, gridSize);

        if (winningCombo) {
            isGameOver = true;
            const winner = boardState[winningCombo[0]];
            highlightWinningCells(winningCombo);
            drawWinLine(winningCombo);

            scores[winner]++;
            setStorage('tictactoe_scores', JSON.stringify(scores));
            updateScoreboardDisplay();

            playSound('win');
            triggerConfetti();

            setTimeout(() => {
                showModal(
                    winner === 'X' ? '🎉 Player X Wins!' : (mode === 'pve' ? '🤖 AI Wins!' : '🎉 Player O Wins!'),
                    `Great game! ${winner} dominated the board.`
                );
            }, 700);

            return true;
        }

        // Check Draw
        if (boardState.every(cell => cell !== '')) {
            isGameOver = true;
            scores.draws++;
            setStorage('tictactoe_scores', JSON.stringify(scores));
            updateScoreboardDisplay();

            playSound('draw');

            statusTextEl.innerHTML = `<span style="color: var(--color-draw);">Game Draw!</span>`;

            setTimeout(() => {
                showModal('🤝 It\'s a Draw!', 'Both players fought hard! Ready for a rematch?');
            }, 600);

            return true;
        }

        return false;
    }

    // ==========================================================================
    // Winning Logic & Calculations
    // ==========================================================================

    function getWinningCombinations(size) {
        const combos = [];

        // Rows
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                row.push(r * size + c);
            }
            combos.push(row);
        }

        // Columns
        for (let c = 0; c < size; c++) {
            const col = [];
            for (let r = 0; r < size; r++) {
                col.push(r * size + c);
            }
            combos.push(col);
        }

        // Main Diagonal
        const mainDiag = [];
        for (let i = 0; i < size; i++) {
            mainDiag.push(i * size + i);
        }
        combos.push(mainDiag);

        // Anti Diagonal
        const antiDiag = [];
        for (let i = 0; i < size; i++) {
            antiDiag.push(i * size + (size - 1 - i));
        }
        combos.push(antiDiag);

        return combos;
    }

    function getWinningCombination(state, size) {
        const combos = getWinningCombinations(size);
        for (let combo of combos) {
            const first = state[combo[0]];
            if (first !== '' && combo.every(idx => state[idx] === first)) {
                return combo;
            }
        }
        return null;
    }

    // ==========================================================================
    // AI Algorithms (Easy, Medium, Minimax)
    // ==========================================================================

    function getAIMove() {
        const availableIndices = boardState
            .map((val, idx) => (val === '' ? idx : null))
            .filter(val => val !== null);

        if (availableIndices.length === 0) return -1;

        if (difficulty === 'easy') {
            return availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }

        if (difficulty === 'medium') {
            // 60% smart, 40% random
            if (Math.random() < 0.4) {
                return availableIndices[Math.floor(Math.random() * availableIndices.length)];
            }
            return getBestSmartMove(availableIndices);
        }

        // Unbeatable (Hard)
        if (gridSize === 3) {
            return getMinimaxMove(boardState, 'O').index;
        } else {
            // For 4x4 grid, use depth-limited Minimax or heuristic search for instant performance
            return getDepthLimitedAIMove();
        }
    }

    function getBestSmartMove(availableIndices) {
        // 1. Can AI win in 1 move?
        for (let idx of availableIndices) {
            const tempBoard = [...boardState];
            tempBoard[idx] = 'O';
            if (getWinningCombination(tempBoard, gridSize)) return idx;
        }

        // 2. Can Player block opponent's win in 1 move?
        for (let idx of availableIndices) {
            const tempBoard = [...boardState];
            tempBoard[idx] = 'X';
            if (getWinningCombination(tempBoard, gridSize)) return idx;
        }

        // 3. Take Center if available
        const center = Math.floor((gridSize * gridSize) / 2);
        if (boardState[center] === '') return center;

        // 4. Random fallback
        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    function getMinimaxMove(state, player, depth = 0) {
        const availableIndices = state
            .map((val, idx) => (val === '' ? idx : null))
            .filter(val => val !== null);

        const winCombo = getWinningCombination(state, 3);
        if (winCombo) {
            const winner = state[winCombo[0]];
            if (winner === 'O') return { score: 10 - depth };
            if (winner === 'X') return { score: depth - 10 };
        } else if (availableIndices.length === 0) {
            return { score: 0 };
        }

        const moves = [];

        for (let idx of availableIndices) {
            const move = { index: idx };
            state[idx] = player;

            if (player === 'O') {
                const result = getMinimaxMove(state, 'X', depth + 1);
                move.score = result.score;
            } else {
                const result = getMinimaxMove(state, 'O', depth + 1);
                move.score = result.score;
            }

            state[idx] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            for (let move of moves) {
                if (move.score > bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let move of moves) {
                if (move.score < bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            }
        }

        return bestMove;
    }

    function getDepthLimitedAIMove() {
        const availableIndices = boardState
            .map((val, idx) => (val === '' ? idx : null))
            .filter(val => val !== null);

        // Immediate win or block check first
        const smart = getBestSmartMove(availableIndices);
        if (smart !== undefined) return smart;

        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    // ==========================================================================
    // UI Updates & Displays
    // ==========================================================================

    function updateTurnDisplay() {
        if (isGameOver) return;

        const isX = currentPlayer === 'X';
        const colorClass = isX ? 'mark-x-color' : 'mark-o-color';
        const playerName = isX ? 'Player X' : (mode === 'pve' ? 'AI (O)' : 'Player O');

        statusTextEl.innerHTML = `Current Turn: <strong class="${colorClass}">${playerName}</strong>`;

        scoreCardXEl.classList.toggle('active', isX);
        scoreCardOEl.classList.toggle('active', !isX);
    }

    function updateLabels() {
        labelPlayerXEl.textContent = 'Player X';
        labelPlayerOEl.textContent = mode === 'pve' ? 'AI (O)' : 'Player O';
        difficultyGroupEl.style.display = mode === 'pve' ? 'flex' : 'none';
    }

    function updateScoreboardDisplay() {
        scoreXEl.textContent = scores.X;
        scoreOEl.textContent = scores.O;
        scoreDrawEl.textContent = scores.draws;
    }

    function disableBoardInteraction(disable) {
        const cells = boardEl.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (disable) cell.classList.add('disabled');
            else cell.classList.remove('disabled');
        });
    }

    function highlightWinningCells(combo) {
        combo.forEach(idx => {
            if (boardEl.children[idx]) {
                boardEl.children[idx].classList.add('winning-cell');
            }
        });
    }

    // ==========================================================================
    // SVG Win Line Generator
    // ==========================================================================

    function drawWinLine(combo) {
        const firstCell = boardEl.children[combo[0]];
        const lastCell = boardEl.children[combo[combo.length - 1]];

        if (!firstCell || !lastCell) return;

        const boardRect = boardEl.getBoundingClientRect();
        const r1 = firstCell.getBoundingClientRect();
        const r2 = lastCell.getBoundingClientRect();

        const x1 = (r1.left + r1.width / 2) - boardRect.left;
        const y1 = (r1.top + r1.height / 2) - boardRect.top;
        const x2 = (r2.left + r2.width / 2) - boardRect.left;
        const y2 = (r2.top + r2.height / 2) - boardRect.top;

        winningLine.setAttribute('x1', x1);
        winningLine.setAttribute('y1', y1);
        winningLine.setAttribute('x2', x2);
        winningLine.setAttribute('y2', y2);

        winningLineSvg.style.display = 'block';
        winningLine.classList.add('draw-line');
    }

    function clearWinningLine() {
        winningLineSvg.style.display = 'none';
        winningLine.classList.remove('draw-line');
        winningLine.setAttribute('x1', 0);
        winningLine.setAttribute('y1', 0);
        winningLine.setAttribute('x2', 0);
        winningLine.setAttribute('y2', 0);
    }

    // ==========================================================================
    // Modal & Confetti
    // ==========================================================================

    function showModal(title, msg) {
        modalTitle.textContent = title;
        modalMessage.textContent = msg;
        modalOverlay.classList.remove('hidden');
    }

    function hideModal() {
        modalOverlay.classList.add('hidden');
    }

    // Particle Confetti
    function triggerConfetti() {
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = confettiCanvas.parentElement.clientWidth;
        confettiCanvas.height = confettiCanvas.parentElement.clientHeight;

        const particles = [];
        const colors = ['#00f2fe', '#ff007f', '#f59e0b', '#3b82f6', '#10b981', '#ec4899'];

        for (let i = 0; i < 70; i++) {
            particles.push({
                x: confettiCanvas.width / 2,
                y: confettiCanvas.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.7) * 12,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        function render() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let active = false;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // gravity
                p.opacity -= 0.015;
                p.rotation += p.rSpeed;

                if (p.opacity > 0) {
                    active = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = Math.max(0, p.opacity);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                }
            });

            if (active) {
                confettiAnimationId = requestAnimationFrame(render);
            }
        }

        render();
    }

    function stopConfetti() {
        if (confettiAnimationId) {
            cancelAnimationFrame(confettiAnimationId);
            confettiAnimationId = null;
        }
        const ctx = confettiCanvas.getContext('2d');
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }

    // ==========================================================================
    // Web Audio Synthesizer (Zero External Dependencies)
    // ==========================================================================

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function updateSoundIcon() {
        soundIconEl.textContent = soundEnabled ? '🔊' : '🔇';
        btnSound.setAttribute('title', soundEnabled ? 'Mute Sound (Shortcut: M)' : 'Enable Sound (Shortcut: M)');
    }

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'moveX') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'moveO') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'win') {
                // Victory Chord Arpeggio
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.08);
                    g.gain.setValueAtTime(0.15, now + idx * 0.08);
                    g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
                    o.start(now + idx * 0.08);
                    o.stop(now + idx * 0.08 + 0.3);
                });
            } else if (type === 'draw') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(150, now + 0.3);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            }
        } catch (err) {
            // Ignore audio context autoplay restriction errors
        }
    }

    // ==========================================================================
    // Accessibility & Keyboard Navigation
    // ==========================================================================

    function handleCellKeyDown(e, index) {
        const totalCells = gridSize * gridSize;
        let targetIndex = index;

        if (e.key === 'ArrowRight') {
            targetIndex = (index + 1) % totalCells;
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            targetIndex = (index - 1 + totalCells) % totalCells;
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            targetIndex = (index + gridSize) % totalCells;
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            targetIndex = (index - gridSize + totalCells) % totalCells;
            e.preventDefault();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCellClick(index);
            return;
        }

        if (targetIndex !== index) {
            focusCell(targetIndex);
        }
    }

    function focusCell(index) {
        const cells = boardEl.querySelectorAll('.cell');
        cells.forEach((cell, idx) => {
            if (idx === index) {
                cell.setAttribute('tabindex', '0');
                cell.focus();
                focusedCellIndex = index;
            } else {
                cell.setAttribute('tabindex', '-1');
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
