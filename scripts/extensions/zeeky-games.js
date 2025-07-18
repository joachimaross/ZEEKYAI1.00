// Zeeky Games Extension - Interactive Games with AI Personality
class ZeekyGamesManager {
    constructor() {
        this.currentGame = null;
        this.gameHistory = [];
        this.playerStats = {
            wins: 0,
            losses: 0,
            draws: 0,
            gamesPlayed: 0
        };
        this.trashTalkMode = true;
        this.difficultyLevel = 'medium';
        this.init();
    }

    init() {
        this.loadStats();
        this.createGamesUI();
        this.setupEventListeners();
        console.log('🎮 Zeeky Games loaded - Ready to play and talk trash!');
    }

    createGamesUI() {
        // Create games container if it doesn't exist
        if (!document.getElementById('zeeky-games')) {
            const gamesContainer = document.createElement('div');
            gamesContainer.id = 'zeeky-games';
            gamesContainer.className = 'zeeky-games-container';
            gamesContainer.innerHTML = `
                <div class="games-header">
                    <h2>🎮 Zeeky Games</h2>
                    <div class="games-stats">
                        <span>W: ${this.playerStats.wins}</span>
                        <span>L: ${this.playerStats.losses}</span>
                        <span>D: ${this.playerStats.draws}</span>
                    </div>
                </div>
                <div class="games-menu">
                    <button class="game-btn" data-game="tictactoe">
                        <i class="fas fa-th"></i>
                        Tic Tac Toe
                    </button>
                    <button class="game-btn" data-game="snake">
                        <i class="fas fa-snake"></i>
                        Snake
                    </button>
                    <button class="game-btn" data-game="poker">
                        <i class="fas fa-poker-chip"></i>
                        Poker
                    </button>
                    <button class="game-btn" data-game="spades">
                        <i class="fas fa-spade"></i>
                        Spades
                    </button>
                    <button class="game-btn" data-game="blackjack">
                        <i class="fas fa-cards"></i>
                        Blackjack
                    </button>
                    <button class="game-btn" data-game="rps">
                        <i class="fas fa-hand-rock"></i>
                        Rock Paper Scissors
                    </button>
                </div>
                <div class="game-area" id="game-area"></div>
                <div class="zeeky-chat" id="zeeky-game-chat">
                    <div class="chat-messages" id="game-chat-messages"></div>
                    <div class="zeeky-avatar">
                        <img src="assets/zeeky-logo.svg" alt="Zeeky" class="zeeky-face" id="zeeky-face">
                        <div class="zeeky-expression" id="zeeky-expression">😎</div>
                    </div>
                </div>
            `;
            
            // Add to main content or create modal
            document.body.appendChild(gamesContainer);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-game]')) {
                const gameType = event.target.dataset.game;
                this.startGame(gameType);
            }
        });
    }

    startGame(gameType) {
        this.currentGame = gameType;
        this.clearGameArea();
        this.zeekySpeak(`Alright, let's play ${gameType}! Hope you're ready to lose! 😏`);
        
        switch (gameType) {
            case 'tictactoe':
                this.initTicTacToe();
                break;
            case 'snake':
                this.initSnake();
                break;
            case 'poker':
                this.initPoker();
                break;
            case 'spades':
                this.initSpades();
                break;
            case 'blackjack':
                this.initBlackjack();
                break;
            case 'rps':
                this.initRockPaperScissors();
                break;
        }
    }

    // Tic Tac Toe Game
    initTicTacToe() {
        this.ticTacToeBoard = Array(9).fill('');
        this.currentPlayer = 'X'; // Player is X, Zeeky is O
        
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="tic-tac-toe">
                <h3>Tic Tac Toe - You're X, I'm O</h3>
                <div class="tic-tac-toe-board" id="ttt-board">
                    ${Array(9).fill(0).map((_, i) => 
                        `<div class="ttt-cell" data-index="${i}"></div>`
                    ).join('')}
                </div>
                <div class="game-status" id="ttt-status">Your turn! Make your move...</div>
            </div>
        `;

        // Add click listeners to cells
        document.querySelectorAll('.ttt-cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleTicTacToeMove(e));
        });

        this.zeekySpeak("You go first! But don't think it'll help you win! 🤨");
        this.setZeekyExpression('😤');
    }

    handleTicTacToeMove(event) {
        const index = parseInt(event.target.dataset.index);
        
        if (this.ticTacToeBoard[index] !== '' || this.currentPlayer !== 'X') {
            return;
        }

        // Player move
        this.ticTacToeBoard[index] = 'X';
        event.target.textContent = 'X';
        event.target.classList.add('player-move');

        if (this.checkTicTacToeWin('X')) {
            this.handleGameEnd('win', 'Tic Tac Toe');
            this.zeekySpeak("What?! How did you... *grumbles* Lucky shot! 😠");
            this.setZeekyExpression('😤');
            return;
        }

        if (this.ticTacToeBoard.every(cell => cell !== '')) {
            this.handleGameEnd('draw', 'Tic Tac Toe');
            this.zeekySpeak("A draw? I guess you're not completely hopeless... 😐");
            this.setZeekyExpression('😑');
            return;
        }

        // Zeeky's turn
        this.currentPlayer = 'O';
        setTimeout(() => this.zeekyTicTacToeMove(), 1000);
    }

    zeekyTicTacToeMove() {
        const trashTalk = [
            "Watch and learn! 😎",
            "This is how it's done! 💪",
            "Too easy! 🙄",
            "You're making this too simple! 😏",
            "Checkmate... wait, wrong game! 🤖"
        ];

        this.zeekySpeak(trashTalk[Math.floor(Math.random() * trashTalk.length)]);

        // AI logic for Zeeky's move
        let move = this.getBestTicTacToeMove();
        
        this.ticTacToeBoard[move] = 'O';
        const cell = document.querySelector(`[data-index="${move}"]`);
        cell.textContent = 'O';
        cell.classList.add('zeeky-move');

        if (this.checkTicTacToeWin('O')) {
            this.handleGameEnd('loss', 'Tic Tac Toe');
            this.zeekySpeak("BOOM! That's how you play! Better luck next time! 😎");
            this.setZeekyExpression('😎');
            return;
        }

        if (this.ticTacToeBoard.every(cell => cell !== '')) {
            this.handleGameEnd('draw', 'Tic Tac Toe');
            this.zeekySpeak("A draw? I was going easy on you! 😏");
            this.setZeekyExpression('😏');
            return;
        }

        this.currentPlayer = 'X';
        document.getElementById('ttt-status').textContent = 'Your turn!';
    }

    getBestTicTacToeMove() {
        // Check if Zeeky can win
        for (let i = 0; i < 9; i++) {
            if (this.ticTacToeBoard[i] === '') {
                this.ticTacToeBoard[i] = 'O';
                if (this.checkTicTacToeWin('O')) {
                    this.ticTacToeBoard[i] = '';
                    return i;
                }
                this.ticTacToeBoard[i] = '';
            }
        }

        // Check if need to block player
        for (let i = 0; i < 9; i++) {
            if (this.ticTacToeBoard[i] === '') {
                this.ticTacToeBoard[i] = 'X';
                if (this.checkTicTacToeWin('X')) {
                    this.ticTacToeBoard[i] = '';
                    return i;
                }
                this.ticTacToeBoard[i] = '';
            }
        }

        // Take center if available
        if (this.ticTacToeBoard[4] === '') return 4;

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.ticTacToeBoard[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take any available space
        const available = this.ticTacToeBoard.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    checkTicTacToeWin(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        return winPatterns.some(pattern => 
            pattern.every(index => this.ticTacToeBoard[index] === player)
        );
    }

    // Snake Game
    initSnake() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="snake-game">
                <h3>Snake Game - Beat My High Score!</h3>
                <div class="snake-info">
                    <div>Score: <span id="snake-score">0</span></div>
                    <div>Zeeky's Best: <span id="zeeky-best">247</span></div>
                </div>
                <canvas id="snake-canvas" width="400" height="400"></canvas>
                <div class="snake-controls">
                    <button onclick="window.zeekyGames.startSnake()">Start Game</button>
                    <div class="controls-info">Use WASD or Arrow Keys</div>
                </div>
            </div>
        `;

        this.zeekySpeak("Snake? I'm the master of this game! My high score is 247. Think you can beat that? 🐍");
        this.setZeekyExpression('😏');
    }

    // Rock Paper Scissors
    initRockPaperScissors() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="rps-game">
                <h3>Rock Paper Scissors - Best of 5</h3>
                <div class="rps-score">
                    <div>You: <span id="player-rps-score">0</span></div>
                    <div>Zeeky: <span id="zeeky-rps-score">0</span></div>
                </div>
                <div class="rps-choices">
                    <button class="rps-btn" data-choice="rock">
                        <i class="fas fa-hand-rock"></i>
                        Rock
                    </button>
                    <button class="rps-btn" data-choice="paper">
                        <i class="fas fa-hand-paper"></i>
                        Paper
                    </button>
                    <button class="rps-btn" data-choice="scissors">
                        <i class="fas fa-hand-scissors"></i>
                        Scissors
                    </button>
                </div>
                <div class="rps-result" id="rps-result"></div>
            </div>
        `;

        this.rpsPlayerScore = 0;
        this.rpsZeekyScore = 0;

        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.playRPS(e.target.dataset.choice));
        });

        this.zeekySpeak("Rock Paper Scissors? I've got lightning reflexes! Bring it on! ⚡");
        this.setZeekyExpression('😤');
    }

    playRPS(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const zeekyChoice = choices[Math.floor(Math.random() * choices.length)];
        
        const result = this.getRPSResult(playerChoice, zeekyChoice);
        
        const resultDiv = document.getElementById('rps-result');
        resultDiv.innerHTML = `
            <div class="rps-round">
                <div>You chose: ${playerChoice}</div>
                <div>Zeeky chose: ${zeekyChoice}</div>
                <div class="round-result">${result}</div>
            </div>
        `;

        if (result === 'You win!') {
            this.rpsPlayerScore++;
            this.zeekySpeak("Lucky guess! Won't happen again! 😠");
            this.setZeekyExpression('😠');
        } else if (result === 'Zeeky wins!') {
            this.rpsZeekyScore++;
            this.zeekySpeak("Too easy! I can read you like a book! 😎");
            this.setZeekyExpression('😎');
        } else {
            this.zeekySpeak("Great minds think alike... or fools seldom differ! 🤔");
            this.setZeekyExpression('🤔');
        }

        document.getElementById('player-rps-score').textContent = this.rpsPlayerScore;
        document.getElementById('zeeky-rps-score').textContent = this.rpsZeekyScore;

        if (this.rpsPlayerScore === 3) {
            this.handleGameEnd('win', 'Rock Paper Scissors');
            this.zeekySpeak("What?! This is impossible! You must be cheating! 😡");
            this.setZeekyExpression('😡');
        } else if (this.rpsZeekyScore === 3) {
            this.handleGameEnd('loss', 'Rock Paper Scissors');
            this.zeekySpeak("Victory is mine! I am the RPS champion! 👑");
            this.setZeekyExpression('😎');
        }
    }

    getRPSResult(player, zeeky) {
        if (player === zeeky) return 'Tie!';
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };

        return winConditions[player] === zeeky ? 'You win!' : 'Zeeky wins!';
    }

    // Poker Game (Simplified)
    initPoker() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="poker-game">
                <h3>5-Card Draw Poker</h3>
                <div class="poker-chips">
                    <div>Your Chips: <span id="player-chips">1000</span></div>
                    <div>Zeeky's Chips: <span id="zeeky-chips">1000</span></div>
                    <div>Pot: <span id="pot">0</span></div>
                </div>
                <div class="poker-table">
                    <div class="zeeky-cards">
                        <div class="card-back">🂠</div>
                        <div class="card-back">🂠</div>
                        <div class="card-back">🂠</div>
                        <div class="card-back">🂠</div>
                        <div class="card-back">🂠</div>
                    </div>
                    <div class="player-cards" id="player-cards"></div>
                </div>
                <div class="poker-actions">
                    <button onclick="window.zeekyGames.dealPokerHand()">Deal Cards</button>
                    <button id="poker-call">Call</button>
                    <button id="poker-raise">Raise</button>
                    <button id="poker-fold">Fold</button>
                </div>
            </div>
        `;

        this.zeekySpeak("Poker? Now we're talking! I've got the best poker face in the business! 😐");
        this.setZeekyExpression('😐'); // Poker face activated
    }

    // Blackjack Game
    initBlackjack() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="blackjack-game">
                <h3>Blackjack - Beat the House!</h3>
                <div class="blackjack-table">
                    <div class="dealer-area">
                        <h4>Zeeky (Dealer)</h4>
                        <div class="dealer-cards" id="dealer-cards"></div>
                        <div class="dealer-total" id="dealer-total">Total: ?</div>
                    </div>
                    <div class="player-area">
                        <h4>You</h4>
                        <div class="player-cards" id="blackjack-player-cards"></div>
                        <div class="player-total" id="player-total">Total: 0</div>
                    </div>
                </div>
                <div class="blackjack-actions">
                    <button onclick="window.zeekyGames.dealBlackjack()">Deal</button>
                    <button id="bj-hit">Hit</button>
                    <button id="bj-stand">Stand</button>
                    <button id="bj-double">Double Down</button>
                </div>
            </div>
        `;

        this.zeekySpeak("Blackjack! The house always wins, and I AM the house! 🏠");
        this.setZeekyExpression('😏');
    }

    // Zeeky's Personality System
    zeekySpeak(message) {
        const chatMessages = document.getElementById('game-chat-messages');
        if (chatMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'zeeky-message';
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <strong>Zeeky:</strong> ${message}
                </div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    setZeekyExpression(expression) {
        const expressionDiv = document.getElementById('zeeky-expression');
        if (expressionDiv) {
            expressionDiv.textContent = expression;
            
            // Add animation
            expressionDiv.style.transform = 'scale(1.2)';
            setTimeout(() => {
                expressionDiv.style.transform = 'scale(1)';
            }, 200);
        }
    }

    handleGameEnd(result, gameName) {
        this.playerStats.gamesPlayed++;
        
        if (result === 'win') {
            this.playerStats.wins++;
        } else if (result === 'loss') {
            this.playerStats.losses++;
        } else {
            this.playerStats.draws++;
        }

        this.saveStats();
        this.updateStatsDisplay();

        // Record game in history
        this.gameHistory.push({
            game: gameName,
            result: result,
            timestamp: new Date().toISOString()
        });

        setTimeout(() => {
            const playAgain = confirm(`Game Over! ${result === 'win' ? 'You won!' : result === 'loss' ? 'You lost!' : 'It\'s a draw!'}\n\nWant to play again?`);
            if (playAgain) {
                this.startGame(this.currentGame);
            } else {
                this.clearGameArea();
                this.zeekySpeak("Good games! Come back when you want another beating! 😎");
                this.setZeekyExpression('😎');
            }
        }, 1000);
    }

    clearGameArea() {
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.innerHTML = '<div class="no-game">Select a game to start playing!</div>';
        }
    }

    updateStatsDisplay() {
        const statsElements = document.querySelectorAll('.games-stats span');
        if (statsElements.length >= 3) {
            statsElements[0].textContent = `W: ${this.playerStats.wins}`;
            statsElements[1].textContent = `L: ${this.playerStats.losses}`;
            statsElements[2].textContent = `D: ${this.playerStats.draws}`;
        }
    }

    saveStats() {
        localStorage.setItem('zeeky_game_stats', JSON.stringify(this.playerStats));
        localStorage.setItem('zeeky_game_history', JSON.stringify(this.gameHistory));
    }

    loadStats() {
        const savedStats = localStorage.getItem('zeeky_game_stats');
        const savedHistory = localStorage.getItem('zeeky_game_history');
        
        if (savedStats) {
            this.playerStats = JSON.parse(savedStats);
        }
        
        if (savedHistory) {
            this.gameHistory = JSON.parse(savedHistory);
        }
    }

    // Public API
    showGames() {
        const gamesContainer = document.getElementById('zeeky-games');
        if (gamesContainer) {
            gamesContainer.style.display = 'block';
            this.zeekySpeak("Ready to play some games? I hope you're prepared to lose! 😈");
            this.setZeekyExpression('😈');
        }
    }

    hideGames() {
        const gamesContainer = document.getElementById('zeeky-games');
        if (gamesContainer) {
            gamesContainer.style.display = 'none';
        }
    }

    getStats() {
        return {
            ...this.playerStats,
            winRate: this.playerStats.gamesPlayed > 0 ? 
                (this.playerStats.wins / this.playerStats.gamesPlayed * 100).toFixed(1) + '%' : '0%'
        };
    }
}

// Initialize Zeeky Games
document.addEventListener('DOMContentLoaded', () => {
    window.zeekyGames = new ZeekyGamesManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZeekyGamesManager;
}
