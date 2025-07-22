window.KeralaBRace = window.KeralaBRace || {};

export class UIManager {
    constructor(gameManager) {
      this.gameManager = gameManager;
      this.elements = {};
      this.countdownInterval = null;
      this.isCountdownActive = false;
      
      this.init();
    }

    /**
     * Initialize UI Manager
     */
    init() {
      this.cacheElements();
      this.setupEventListeners();
      console.log('✓ UI Manager initialized');
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
      this.elements = {
        // Loading screen
        loadingScreen: document.getElementById('loadingScreen'),
        loadingProgress: document.getElementById('loadingProgress'),
        
        // Logo and start screen
        logoScreen: document.getElementById('logoScreen'),
        startButton: document.getElementById('startButton'),
        gameLogo: document.getElementById('gameLogo'),
        
        // Countdown
        countdownOverlay: document.getElementById('countdownOverlay'),
        countdownNumber: document.getElementById('countdownNumber'),
        
        // Game UI
        gameUI: document.getElementById('gameUI'),
        distance1: document.getElementById('distance1'),
        distance2: document.getElementById('distance2'),
        pauseButton: document.getElementById('pauseButton'),
        
        // Winner screen
        winnerScreen: document.getElementById('winner'),
        winnerText: document.getElementById('winnerText'),
        restartButton: document.getElementById('restartButton'),
        
        // Controls info
        controlsInfo: document.getElementById('controlsInfo')
      };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
      // Pause button
      if (this.elements.pauseButton) {
        this.elements.pauseButton.addEventListener('click', () => this.onPauseButtonClick());
      }

      // Restart button
      if (this.elements.restartButton) {
        this.elements.restartButton.addEventListener('click', () => this.onRestartButtonClick());
      }

      // Keyboard shortcuts
      document.addEventListener('keydown', (event) => {
        this.handleKeyboardShortcuts(event);
      });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
      // Pause/Resume with spacebar
      if (event.code === 'Space' && this.gameManager.getGameState().current === 'playing') {
        event.preventDefault();
      }
      
      // Restart with R key
      if (event.key === 'r' || event.key === 'R') {
        if (this.gameManager.getGameState().current === 'finished') {
          event.preventDefault();
          this.onRestartButtonClick();
        }
      }
    }

    /**
     * Show game ready screen - NOW STARTS COUNTDOWN AUTOMATICALLY
     */
    showGameReady() {
      this.showGameUI();
      
      // Start countdown automatically after a brief delay
      setTimeout(() => {
        this.startCountdown();
      }, 1000);
    }


    /**
     * Hide controls information
     */
    hideControlsInfo() {
      if (this.elements.controlsInfo) {
        this.elements.controlsInfo.style.display = 'none';
      }
    }

    /**
     * Show game UI
     */
    showGameUI() {
      if (this.elements.gameUI) {
        this.elements.gameUI.style.display = 'block';
      }
    }

    /**
     * Hide game UI
     */
    hideGameUI() {
      if (this.elements.gameUI) {
        this.elements.gameUI.style.display = 'none';
      }
    }

    /**
     * Start countdown sequence - MAIN COUNTDOWN FUNCTION
     */
    startCountdown() {
      if (this.isCountdownActive) return;
      
      this.isCountdownActive = true;
      
      // Update game state to countdown
      this.gameManager.gameState.current = 'countdown';
      
      if (!this.elements.countdownOverlay || !this.elements.countdownNumber) {
        console.error('Countdown elements not found');
        this.onCountdownComplete();
        return;
      }
      
      let countdown = 3;
      this.elements.countdownOverlay.style.display = 'flex';
      this.elements.countdownOverlay.style.opacity = '0';
      
      // Fade in countdown overlay
      setTimeout(() => {
        this.elements.countdownOverlay.style.transition = 'opacity 0.3s ease-in';
        this.elements.countdownOverlay.style.opacity = '1';
      }, 100);
      
      // Show initial countdown number
      this.elements.countdownNumber.textContent = countdown;
      this.elements.countdownNumber.style.transform = 'scale(1)';
      this.elements.countdownNumber.style.color = '#fff';

      // Start countdown timer
      this.countdownInterval = setInterval(() => {
        if (countdown > 1) {
          countdown--;
          this.elements.countdownNumber.textContent = countdown;
          
          // Animate number change
          this.elements.countdownNumber.style.transform = 'scale(0.5)';
          setTimeout(() => {
            this.elements.countdownNumber.style.transform = 'scale(1)';
          }, 100);
          
        } else {
          // Show "GO!" message
          this.elements.countdownNumber.textContent = "GO!";
          this.elements.countdownNumber.style.color = '#4caf50';
          this.elements.countdownNumber.style.transform = 'scale(1.2)';
          
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;

          // Hide countdown and start game
          setTimeout(() => {
            this.hideCountdown();
            this.onCountdownComplete();
          }, 800);
        }
      }, 1000);
    }

    /**
     * Hide countdown overlay
     */
    hideCountdown() {
      if (this.elements.countdownOverlay) {
        this.elements.countdownOverlay.style.transition = 'opacity 0.3s ease-out';
        this.elements.countdownOverlay.style.opacity = '0';
        
        setTimeout(() => {
          this.elements.countdownOverlay.style.display = 'none';
          this.elements.countdownNumber.style.color = '#fff';
          this.elements.countdownNumber.style.transform = 'scale(1)';
        }, 300);
      }
      
      this.isCountdownActive = false;
    }

    /**
     * Countdown complete callback
     */
    onCountdownComplete() {
      // Hide controls info and start actual gameplay
      this.hideControlsInfo();
      this.gameManager.startGameplay();
    }



    /**
     * Restart button click handler
     */
    onRestartButtonClick() {
      this.gameManager.restart();
    }

    /**
     * Update distance display
     */
    updateDistanceDisplay(player1Distance, player2Distance) {
    const playerNames = this.gameManager.getPlayerNames(); 

    if (this.elements.distance1) {
      this.elements.distance1.textContent = `${playerNames[0]}: ${player1Distance}m`;
    }

    if (this.elements.distance2) {
      this.elements.distance2.textContent = `${playerNames[1]}: ${player2Distance}m`;
    }
  }

  resetDistances() {
    const playerNames = this.gameManager.getPlayerNames();
    if (this.elements.distance1) {
      this.elements.distance1.textContent = `${playerNames[0]}: 0m`;
    }
    if (this.elements.distance2) {
      this.elements.distance2.textContent = `${playerNames[1]}: 0m`;
    }
  }


    /**
     * Show winner screen
     */
    showWinner(winnerIndex) {
    const winnerNames = this.gameManager.getPlayerNames(); // Get real names
    
    if (this.elements.winnerText) {
      this.elements.winnerText.textContent = `🏆 ${winnerNames[winnerIndex]} Wins! 🏆`;
    }

    if (this.elements.winnerScreen) {
      this.elements.winnerScreen.style.display = 'flex';
      this.elements.winnerScreen.style.opacity = '0';

      setTimeout(() => {
        this.elements.winnerScreen.style.transition = 'opacity 0.5s ease-in';
        this.elements.winnerScreen.style.opacity = '1';
      }, 100);
    }
  }


    /**
     * Hide winner screen
     */
    hideWinner() {
      if (this.elements.winnerScreen) {
        this.elements.winnerScreen.style.transition = 'opacity 0.3s ease-out';
        this.elements.winnerScreen.style.opacity = '0';
        
        setTimeout(() => {
          this.elements.winnerScreen.style.display = 'none';
        }, 300);
      }
    }

    /**
     * Show loading screen
     */
    showLoading() {
      if (this.elements.loadingScreen) {
        this.elements.loadingScreen.style.display = 'flex';
      }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
      if (this.elements.loadingScreen) {
        this.elements.loadingScreen.style.display = 'none';
      }
    }

    /**
     * Update loading progress
     */
    updateLoadingProgress(message) {
      if (this.elements.loadingProgress) {
        this.elements.loadingProgress.textContent = message;
      }
    }

    /**
     * Show error message
     */
    showError(message) {
      if (this.elements.loadingScreen) {
        this.elements.loadingScreen.innerHTML = `
          <div style="color: #ff6b6b; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 15px;">⚠️ Error</div>
            <div style="margin-bottom: 20px; font-size: 16px;">${message}</div>
            <button onclick="location.reload()" style="
              padding: 12px 24px; 
              background: #4caf50; 
              color: white; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 16px;
              transition: background 0.3s;
            " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4caf50'">
              Retry
            </button>
          </div>
        `;
      }
    }

    /**
     * Game state change handlers
     */
    onGameReady() {
      this.showGameReady();
    }

    onGameStart() {
      console.log('UI: Game started');
    }

    onGameWin(winnerIndex) {
      this.showWinner(winnerIndex);
    }

    onGameRestart() {
      this.hideWinner();
      this.showGameReady();
    }

    /**
     * Cleanup
     */
    destroy() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      
      this.isCountdownActive = false;
      console.log('UI Manager destroyed');
    }
  };
