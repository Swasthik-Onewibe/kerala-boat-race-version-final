import * as THREE from '/static/lib/three.module.js';
import { GLTFLoader } from '/static/lib/GLTFLoader.js';
import { Environment } from './environment.js';
import { UIManager } from './UIManager.js';        
import { AudioManager } from './AudioManager.js';   
import { Controls } from './controls.js'; 
import { BoatManager } from './boats.js';

window.KeralaBRace = window.KeralaBRace || {};

window.KeralaBRace.GameManager = class GameManager {
  constructor() {
    // Three.js core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    
    // Performance optimization flags
    this.performanceMode = this.detectPerformanceMode();
    this.frameCount = 0;
    this.lastFPSCheck = 0;
    this.currentFPS = 60;
    
    // Game components
    this.boatManager = null;
    this.environment = null;
    this.controls = null;
    this.uiManager = null;
    this.audioManager = null;
    
    // Player information from URL parameters
    this.playerInfo = this.extractPlayerInfo();
    
    // Game state
    this.gameState = {
      current: 'loading',
      isRunning: false,
      isPaused: false,
      gameWon: false,
      winner: null,
      startTime: null
    };
    
    // Animation
    this.animationId = null;
    this.isInitialized = false;
  }

  /**
   * Detect device performance capabilities
   */
  detectPerformanceMode() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'low'; // No WebGL support
    }
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    // Check for mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for low-end indicators
    const isLowEnd = isMobile || 
                    renderer.includes('Adreno') ||
                    renderer.includes('Mali') ||
                    renderer.includes('PowerVR') ||
                    navigator.hardwareConcurrency < 4;
    
    console.log(`🔧 Performance Mode: ${isLowEnd ? 'Low' : 'High'} (${renderer})`);
    
    return isLowEnd ? 'low' : 'high';
  }

  /**
   * Extract player information from URL parameters
   */
  extractPlayerInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const playerInfo = {
      player1: {
        name: urlParams.get('player1_name') || 'Player 1',
        phone: urlParams.get('player1_phone') || ''
      },
      player2: {
        name: urlParams.get('player2_name') || 'Player 2',
        phone: urlParams.get('player2_phone') || ''
      }
    };
    
    console.log('Player Info extracted:', playerInfo);
    return playerInfo;
  }

  /**
   * Get player names for display
   */
  getPlayerNames() {
    return [
      `${this.playerInfo.player1.name} (Right Boat)`,
      `${this.playerInfo.player2.name} (Left Boat)`
    ];
  }

  /**
   * Get player info object
   */
  getPlayerInfo() {
    return this.playerInfo;
  }

  /**
   * Initialize the entire game system
   */
  async init() {
    try {
      // Initialize UI Manager first (it handles loading screen)
      this.updateLoadingProgress('Initializing UI...');
      this.initializeUI();
      
      // Initialize Audio Manager
      this.updateLoadingProgress('Initializing Audio...');
      this.initializeAudio();
      
      this.updateLoadingProgress('Initializing Three.js...');
      // Verify Three.js is loaded
      if (typeof THREE === 'undefined') {
        throw new Error('Three.js not loaded');
      }
      
      // Initialize core systems
      this.updateLoadingProgress('Creating scene...');
      this.createScene();
      
      this.updateLoadingProgress('Setting up camera...');
      this.createCamera();
      
      this.updateLoadingProgress('Initializing renderer...');
      this.createRenderer();
      
      this.updateLoadingProgress('Setting up lighting...');
      this.setupLighting();
      
      // Initialize game components
      this.updateLoadingProgress('Creating environment...');
      await this.initializeEnvironment();
      
      this.updateLoadingProgress('Setting up controls...');
      this.initializeControls();
      
      this.updateLoadingProgress('Creating boats...');
      await this.initializeBoats();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Mark as initialized and ready
      this.gameState.current = 'ready';
      this.isInitialized = true;
      
      this.hideLoadingScreen();
      
      // Start the render loop
      this.startRenderLoop();
      this.initializeLogo();
      
      // Notify managers of ready state
      if (this.uiManager && this.uiManager.onGameReady) {
        this.uiManager.onGameReady();
      }
      
      if (this.audioManager && this.audioManager.onGameReady) {
        this.audioManager.onGameReady();
      }
      
      console.log('Kerala Snake Boat Race Game initialized successfully!');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to load the game. Please refresh the page.');
      throw error;
    }
  }

  /**
   * Create Three.js scene
   */
  createScene() {
    const config = window.KeralaBRace.CONFIG;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.SCENE_CLEAR_COLOR);
    
    // Optimize fog for performance
    if (this.performanceMode === 'high') {
      this.scene.fog = new THREE.Fog(
        config.SCENE_FOG_COLOR,
        config.SCENE_FOG_NEAR,
        config.SCENE_FOG_FAR
      );
    } else {
      // Simpler fog for low-end devices
      this.scene.fog = new THREE.Fog(
        config.SCENE_FOG_COLOR,
        config.SCENE_FOG_NEAR * 0.7,
        config.SCENE_FOG_FAR * 0.7
      );
    }
  }

  /**
   * Create camera
   */
  createCamera() {
    const config = window.KeralaBRace.CONFIG;
    
    this.camera = new THREE.PerspectiveCamera(
      config.CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      config.CAMERA_NEAR,
      config.CAMERA_FAR
    );
    
    this.camera.position.set(
      config.CAMERA_POSITION.x,
      config.CAMERA_POSITION.y,
      config.CAMERA_POSITION.z
    );
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Create renderer with performance optimizations
   */
  createRenderer() {
    const config = window.KeralaBRace.CONFIG;
    
    const rendererOptions = {
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    };
    
    // Conditional antialiasing based on performance mode
    if (this.performanceMode === 'high') {
      rendererOptions.antialias = true;
    } else {
      rendererOptions.antialias = false;
    }
    
    this.renderer = new THREE.WebGLRenderer(rendererOptions);
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(config.SCENE_CLEAR_COLOR);
    
    // Optimize shadow settings based on performance mode
    if (this.performanceMode === 'high') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = false; // Manual shadow updates
    } else {
      // Disable shadows on low-end devices
      this.renderer.shadowMap.enabled = false;
    }
    
    // Optimize pixel ratio
    const pixelRatio = this.performanceMode === 'high' ? 
      Math.min(window.devicePixelRatio, 2) : 1;
    this.renderer.setPixelRatio(pixelRatio);
    
    // Performance optimizations
    this.renderer.sortObjects = false;
    this.renderer.info.autoReset = false;
    
    const container = document.getElementById('gameContainer');
    container.appendChild(this.renderer.domElement);
    
    console.log(`🎨 Renderer initialized with ${this.performanceMode} performance mode`);
  }

  /**
   * Setup optimized lighting
   */
  setupLighting() {
    const config = window.KeralaBRace.CONFIG;
    
    // Always use ambient light (low cost)
    const ambientLight = new THREE.AmbientLight(
      config.AMBIENT_LIGHT_COLOR,
      this.performanceMode === 'high' ? 
        config.AMBIENT_LIGHT_INTENSITY : 
        config.AMBIENT_LIGHT_INTENSITY * 1.2 // Brighter ambient for no shadows
    );
    this.scene.add(ambientLight);

    // Conditional directional light with shadows
    if (this.performanceMode === 'high') {
      const directionalLight = new THREE.DirectionalLight(
        config.DIRECTIONAL_LIGHT_COLOR,
        config.DIRECTIONAL_LIGHT_INTENSITY
      );
      
      directionalLight.position.set(
        config.DIRECTIONAL_LIGHT_POSITION.x,
        config.DIRECTIONAL_LIGHT_POSITION.y,
        config.DIRECTIONAL_LIGHT_POSITION.z
      );
      
      // Optimized shadow settings
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 512;  // Reduced from 1024
      directionalLight.shadow.mapSize.height = 512; // Reduced from 1024
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 200;     // Reduced from 500
      directionalLight.shadow.bias = -0.0001;
      
      // Limit shadow camera size for better performance
      directionalLight.shadow.camera.left = -50;
      directionalLight.shadow.camera.right = 50;
      directionalLight.shadow.camera.top = 50;
      directionalLight.shadow.camera.bottom = -50;
      
      this.scene.add(directionalLight);
    } else {
      // Simple directional light without shadows for low-end devices
      const directionalLight = new THREE.DirectionalLight(
        config.DIRECTIONAL_LIGHT_COLOR,
        config.DIRECTIONAL_LIGHT_INTENSITY * 0.8
      );
      
      directionalLight.position.set(
        config.DIRECTIONAL_LIGHT_POSITION.x,
        config.DIRECTIONAL_LIGHT_POSITION.y,
        config.DIRECTIONAL_LIGHT_POSITION.z
      );
      
      directionalLight.castShadow = false;
      this.scene.add(directionalLight);
    }
    
    console.log(`💡 Lighting setup complete for ${this.performanceMode} mode`);
  }

  /**
   * Initialize environment
   */
  async initializeEnvironment() {
    const config = window.KeralaBRace.CONFIG;
    this.environment = new Environment(this.scene, config, this.performanceMode);
    await this.environment.init();
  }

  /**
   * Initialize controls
   */
  initializeControls() {
  const config = window.KeralaBRace.CONFIG;
  this.controls = new Controls(config);
}

  /**
   * Initialize boats
   */
  async initializeBoats() {
    this.boatManager = new BoatManager(this.scene, this.performanceMode); 
    await this.boatManager.createBoats();
  }

  initializeLogo() {
    if (window.logoUrl) {
      const logo = document.getElementById('companyLogo');
      if (logo) {
        logo.src = window.logoUrl;
        logo.style.display = 'block';
        console.log("🖼️ Logo loaded:", window.logoUrl);
      } else {
        console.warn("⚠️ Logo element not found in DOM");
      }
    } else {
      console.warn("⚠️ window.logoUrl is not defined");
    }
  }

  /**
   * Initialize UI Manager
   */
  initializeUI() {
  try {
    this.uiManager = new UIManager(this);
    console.log('✓ UI Manager initialized');
  } catch (error) {
    console.error('Error initializing UI Manager:', error);
  }
}

  /**
   * Initialize Audio Manager
   */
  initializeAudio() {
  try {
    this.audioManager = new AudioManager(this);
    console.log('✓ Audio Manager initialized');
  } catch (error) {
    console.error('Error initializing Audio Manager:', error);
  }
}

  /**
   * Start the game with countdown (called by UI Manager)
   */
  startGame() {
    if (this.gameState.current !== 'ready') {
      console.warn('Game not ready to start');
      return;
    }

    this.gameState.current = 'countdown';
    
    // Update shadows once at game start if enabled
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.needsUpdate = true;
    }
    
    // UI Manager will handle countdown and call startGameplay() when ready
    if (this.uiManager && this.uiManager.startCountdown) {
      this.uiManager.startCountdown();
    } else {
      // Fallback if UI Manager not available
      this.startGameplay();
    }
  }

  /**
   * Start actual gameplay (called by UI Manager after countdown)
   */
  startGameplay() {
    console.log('Game started!');
    
    this.gameState.current = 'playing';
    this.gameState.isRunning = true;
    this.gameState.startTime = Date.now();
    
    // Notify managers
    if (this.uiManager && this.uiManager.onGameStart) {
      this.uiManager.onGameStart();
    }
    
    if (this.audioManager && this.audioManager.onGameStart) {
      this.audioManager.onGameStart();
    }
  }

  handleGameRestart() {
    console.log("🔁 Handling remote game restart");

    // Reset game state
    this.gameState = {
      current: 'ready',
      isRunning: false,
      isPaused: false,
      gameWon: false,
      winner: null,
      startTime: null
    };

    // Reset boats
    if (this.boatManager) {
      this.boatManager.resetBoats();
    }

    // Reset UI
    if (this.uiManager) {
      this.uiManager.hideWinner();
      this.uiManager.resetDistances();
      this.uiManager.showGameReady();
    }

    // Reset audio
    if (this.audioManager) {
      this.audioManager.pauseMusic();
    }

    // Restart clock
    this.clock = new THREE.Clock();
  }

  /**
   * Toggle pause
   */
  togglePause() {
    if (this.gameState.current === 'playing') {
      this.gameState.isPaused = !this.gameState.isPaused;
      
      // Notify managers
      if (this.gameState.isPaused) {
        if (this.uiManager && this.uiManager.onGamePause) {
          this.uiManager.onGamePause();
        }
      } else {
        if (this.uiManager && this.uiManager.onGameResume) {
          this.uiManager.onGameResume();
        }
      }
      
      console.log(this.gameState.isPaused ? 'Game paused' : 'Game resumed');
    }
  }

  /**
   * Start the render loop
   */
  startRenderLoop() {
    this.animate();
  }

  /**
   * Monitor FPS performance
   */
  monitorPerformance() {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFPSCheck >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSCheck = now;
      
      // Auto-adjust quality if FPS is too low
      if (this.currentFPS < 30 && this.performanceMode === 'high') {
        console.warn('⚠️ Low FPS detected, switching to low performance mode');
        this.switchToLowPerformanceMode();
      }
    }
  }

  /**
   * Switch to low performance mode during runtime
   */
  switchToLowPerformanceMode() {
    this.performanceMode = 'low';
    
    // Disable shadows
    this.renderer.shadowMap.enabled = false;
    
    // Reduce pixel ratio
    this.renderer.setPixelRatio(1);
    
    // Notify environment to reduce detail
    if (this.environment && this.environment.reduceLOD) {
      this.environment.reduceLOD();
    }
    
    console.log('🔧 Switched to low performance mode');
  }

  /**
   * Optimized animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const deltaTime = Math.min(this.clock.getDelta(), 0.033); // Cap delta time
    
    // Monitor performance
    this.monitorPerformance();
    
    // Always render, but only update game logic when playing
    if (this.gameState.current === 'playing' && !this.gameState.isPaused) {
      this.update(deltaTime);
    }
    
    this.render();
    
    // Reset renderer info periodically
    if (this.frameCount % 60 === 0) {
      this.renderer.info.reset();
    }
  }

  /**
   * Update game systems
   */
  update(deltaTime) {
    this.handleInput();
    this.updateCamera();
    this.updateUI();
    this.checkWinCondition();
    
    // Update environment with throttling
    if (this.environment && this.frameCount % 2 === 0) { // Update every other frame
      this.environment.update(deltaTime);
    }
    
    // Update boat manager
    if (this.boatManager) {
      this.boatManager.updateWaveTime(deltaTime);
    }
  }

  /**
   * Handle input
   */
  handleInput() {
    if (this.gameState.gameWon || !this.boatManager || !this.controls) return;
    
    let player1Moved = false;
    let player2Moved = false;
    
    // Player 1 (W key)
    if (this.controls.isPlayer1Moving()) {
      this.boatManager.moveBoat(0, true);
      player1Moved = true;
    }
    
    // Player 2 (Arrow Up)
    if (this.controls.isPlayer2Moving()) {
      this.boatManager.moveBoat(1, true);
      player2Moved = true;
    }
    
    // Notify audio manager of boat movement
    if (this.audioManager && (player1Moved || player2Moved)) {
      this.audioManager.onBoatMove();
    }
  }

  /**
   * Update camera
   */
  updateCamera() {
    if (!this.boatManager) return;
    
    const config = window.KeralaBRace.CONFIG;
    const boats = this.boatManager.getBoats();
    
    if (boats.length < 2) return;
    
    const averageZ = (boats[0].position.z + boats[1].position.z) / 2;
    this.camera.position.z = averageZ + config.CAMERA_OFFSET_Z;
    this.camera.lookAt(0, 0, averageZ);
  }

  /**
   * Update UI (throttled)
   */
  updateUI() {
    if (!this.boatManager || !this.uiManager) return;
    
    // Only update UI every 5 frames for better performance
    if (this.frameCount % 5 !== 0) return;
    
    const config = window.KeralaBRace.CONFIG;
    const boats = this.boatManager.getBoats();
    
    if (boats.length < 2) return;
    
    const distance1 = Math.max(0, Math.round(config.RACE_DISTANCE - (boats[0].position.z + 75)));
    const distance2 = Math.max(0, Math.round(config.RACE_DISTANCE - (boats[1].position.z + 75)));
    
    // Update UI Manager
    this.uiManager.updateDistanceDisplay(distance1, distance2);
  }

  /**
   * Check win condition
   */
  checkWinCondition() {
    if (this.gameState.gameWon || !this.boatManager) return;
    
    const config = window.KeralaBRace.CONFIG;
    const boats = this.boatManager.getBoats();
    
    if (boats.length < 2) return;
    
    if (boats[0].position.z >= config.FINISH_LINE_Z) {
      this.onGameWon(0);
    } else if (boats[1].position.z >= config.FINISH_LINE_Z) {
      this.onGameWon(1);
    }
  }

  /**
   * Handle game won
   */
  onGameWon(winnerIndex) {
    this.gameState.current = 'finished';
    this.gameState.gameWon = true;
    this.gameState.winner = winnerIndex;
    
    // Notify managers
    if (this.uiManager && this.uiManager.onGameWin) {
      this.uiManager.onGameWin(winnerIndex);
    }
    
    if (this.audioManager && this.audioManager.onGameWin) {
      this.audioManager.onGameWin();
    }
    
    // Use dynamic player names instead of hardcoded ones
    const winnerNames = this.getPlayerNames();
    console.log(`Game won by ${winnerNames[winnerIndex]}`);
  }

  /**
   * Optimized render function
   */
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Restart the game
   */
  restart() {
    console.log('Restarting game...');
    
    this.gameState = {
      current: 'ready',
      isRunning: false,
      isPaused: false,
      gameWon: false,
      winner: null,
      startTime: null
    };
    
    // Reset boat positions
    if (this.boatManager) {
      this.boatManager.resetBoats();
    }
    
    // Reset clock
    this.clock = new THREE.Clock();
    
    // Notify managers
    if (this.uiManager && this.uiManager.onGameRestart) {
      this.uiManager.onGameRestart();
    }
    
    if (this.audioManager && this.audioManager.onGameRestart) {
      this.audioManager.onGameRestart();
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());

    // Handle keyboard shortcuts (P for pause, R for restart)
    document.addEventListener('keydown', (event) => {
      switch(event.key) {
        case 'r':
        case 'R':
          if (event.ctrlKey) {
            event.preventDefault();
            this.restart();
          }
          break;
        case 'p':
        case 'P':
          this.togglePause();
          break;
      }
    });
    
    // Handle visibility changes to pause when tab is not active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.gameState.current === 'playing') {
        this.togglePause();
      }
    });
  }

  // ... (rest of the methods remain the same)
  showLoadingScreen() {
    if (this.uiManager && this.uiManager.showLoading) {
      this.uiManager.showLoading();
    } else {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.style.display = 'block';
      }
    }
  }

  hideLoadingScreen() {
    if (this.uiManager && this.uiManager.hideLoading) {
      this.uiManager.hideLoading();
    } else {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
    }
  }

  updateLoadingProgress(message) {
    if (this.uiManager && this.uiManager.updateLoadingProgress) {
      this.uiManager.updateLoadingProgress(message);
    } else {
      const progressElement = document.getElementById('loadingProgress');
      if (progressElement) {
        progressElement.textContent = message;
      }
    }
    console.log(`Loading: ${message}`);
  }

  showError(message) {
    if (this.uiManager && this.uiManager.showError) {
      this.uiManager.showError(message);
    } else {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.innerHTML = `
          <div style="color: red; font-size: 24px; text-align: center; margin: 20px;">
            ${message}
          </div>
        `;
      }
    }
  }

  getGameState() {
    return { ...this.gameState };
  }

  destroy() {
    console.log('Destroying game...');
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
    
    if (this.controls) {
      this.controls.cleanup();
    }
    
    if (this.uiManager && this.uiManager.destroy) {
      this.uiManager.destroy();
    }
    
    if (this.audioManager && this.audioManager.destroy) {
      this.audioManager.destroy();
    }
    
    this.gameState.current = 'destroyed';
    this.gameState.isRunning = false;
    this.isInitialized = false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.KeralaBRace.gameManager = new window.KeralaBRace.GameManager();
  window.KeralaBRace.gameManager.init();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.KeralaBRace.gameManager) {
    window.KeralaBRace.gameManager.destroy();
  }
});