window.KeralaBRace = window.KeralaBRace || {};

export class AudioManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.audioContext = null;
    this.sounds = {};
    this.soundBuffers = {};
    this.htmlAudioElements = {}; // Separate storage for HTML audio elements
    this.currentMusic = null;
    this.musicVolume = 0.6;
    this.sfxVolume = 0.8;
    this.isMuted = false;
    this.isInitialized = false;
    this.userInteractionReceived = false;
    this.lastSplashTime = 0; // For controlling splash sound frequency
    this.splashCooldown = 200; // Minimum time between splash sounds (ms)
    
    this.init();
  }

  /**
   * Initialize Audio Manager
   */
  async init() {
    try {
      // Don't create AudioContext immediately - wait for user interaction
      this.setupUserInteractionHandler();
      
      // Set up without AudioContext first
      this.setupAudioElements();
      
      console.log('✓ Audio Manager initialized (waiting for user interaction)');
      
    } catch (error) {
      console.error('Failed to initialize Audio Manager:', error);
      // Fallback to silent mode
      this.isInitialized = false;
    }
  }

  /**
   * Setup user interaction handler
   */
  setupUserInteractionHandler() {
    const enableAudio = async () => {
      if (this.userInteractionReceived) return;
      
      try {
        // Create AudioContext after user interaction
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create volume control nodes
        this.masterGain = this.audioContext.createGain();
        this.musicGain = this.audioContext.createGain();
        this.sfxGain = this.audioContext.createGain();
        
        // Connect gain nodes
        this.masterGain.connect(this.audioContext.destination);
        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        
        // Set initial volumes
        this.musicGain.gain.value = this.musicVolume;
        this.sfxGain.gain.value = this.sfxVolume;
        
        // Generate sound effects
        this.generateSoundEffects();
        
        // Load audio files
        this.loadAudioFiles();
        
        this.userInteractionReceived = true;
        this.isInitialized = true;
        
        console.log('✓ Audio enabled after user interaction');
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
        
      } catch (error) {
        console.error('Failed to enable audio:', error);
        this.isInitialized = false;
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    document.addEventListener('touchstart', enableAudio);
  }

  /**
   * Setup HTML5 Audio elements for music
   */
  setupAudioElements() {
    // Background music - we'll use generated audio or provide fallback
    this.sounds.backgroundMusic = this.createAudioElement();
    this.sounds.backgroundMusic.loop = true;
    this.sounds.backgroundMusic.volume = this.musicVolume;
    
    // Victory music
    this.sounds.victoryMusic = this.createAudioElement();
    this.sounds.victoryMusic.volume = this.musicVolume;
  }

  /**
   * Create audio element with error handling
   */
  createAudioElement() {
    const audio = new Audio();
    audio.addEventListener('error', (e) => {
      console.warn('Audio load error:', e);
    });
    return audio;
  }

  /**
   * Generate sound effects using Web Audio API
   */
  generateSoundEffects() {
    if (!this.audioContext) return;
    
    // Generate different sound effects
    this.generateCountdownBeep();
    this.generateStartSound();
    this.generateSplashSound();
    this.generateWinSound();
    this.generateButtonClick();
  }
  
  /**
   * Load audio files (separate from generated sounds)
   */
  loadAudioFiles() {
    const SPLASH_AUDIO_PATH = window.KeralaBRace?.AUDIO_FILES?.splash;
    if (SPLASH_AUDIO_PATH) {
      const splashSound = new Audio(SPLASH_AUDIO_PATH);
      splashSound.load();
      splashSound.volume = this.sfxVolume;
      this.htmlAudioElements.splash = splashSound;
    }
  }

  /**
   * Play splash sound using HTML Audio element
   */
  playSplashSound() {
    const now = Date.now();
    if (now - this.lastSplashTime < this.splashCooldown) {
      return; // Too soon, skip this splash
    }
    
    const splash = this.htmlAudioElements.splash;
    if (splash && !this.isMuted) {
      splash.currentTime = 0;
      splash.volume = this.sfxVolume;
      splash.play().catch(error => {
        console.warn('Error playing splash sound:', error);
      });
      this.lastSplashTime = now;
    }
  }

  /**
   * Generate countdown beep sound
   */
  generateCountdownBeep() {
    const duration = 0.2;
    const frequency = 800;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-t * 3); // Exponential decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    this.soundBuffers.countdownBeep = buffer;
  }

  /**
   * Generate start sound (higher pitch beep)
   */
  generateStartSound() {
    const duration = 0.5;
    const frequency = 1200;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-t * 2);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }
    
    this.soundBuffers.startSound = buffer;
  }

  /**
   * Generate splash sound (for rowing) - using Web Audio API
   */
  generateSplashSound() {
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-t * 4);
      // Generate noise-like sound for splash
      data[i] = (Math.random() * 2 - 1) * envelope * 0.2;
    }
    
    this.soundBuffers.splashGenerated = buffer; // Different name to avoid conflict
  }

  /**
   * Generate victory sound
   */
  generateWinSound() {
    const duration = 1.0;
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.sin(Math.PI * t / duration); // Bell curve envelope
      
      // Triumphant chord-like sound
      const freq1 = 440; // A
      const freq2 = 554.37; // C#
      const freq3 = 659.25; // E
      
      const wave1 = Math.sin(2 * Math.PI * freq1 * t);
      const wave2 = Math.sin(2 * Math.PI * freq2 * t);
      const wave3 = Math.sin(2 * Math.PI * freq3 * t);
      
      data[i] = (wave1 + wave2 + wave3) * envelope * 0.15;
    }
    
    this.soundBuffers.victory = buffer;
  }

  /**
   * Generate button click sound
   */
  generateButtonClick() {
    const duration = 0.1;
    const frequency = 1000;
    
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-t * 10);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }
    
    this.soundBuffers.buttonClick = buffer;
  }

  /**
   * Play sound effect using Web Audio API
   */
  playSoundEffect(soundName) {
    if (!this.isInitialized || this.isMuted || !this.soundBuffers || !this.soundBuffers[soundName]) {
      console.warn(`Sound effect '${soundName}' not available`);
      return;
    }
    
    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.soundBuffers[soundName];
      source.connect(this.sfxGain);
      source.start();
    } catch (error) {
      console.warn('Error playing sound effect:', error);
    }
  }

  /**
   * Generate and play background music
   */
  generateBackgroundMusic() {
    if (!this.audioContext) return;
    
    // Create a simple ambient water-like background sound
    const bufferSize = this.audioContext.sampleRate * 60; // 60 seconds of audio
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.audioContext.sampleRate;
        
        // Layer multiple sine waves for ambient water sound
        const wave1 = Math.sin(2 * Math.PI * 0.5 * t) * 0.1;
        const wave2 = Math.sin(2 * Math.PI * 0.3 * t) * 0.08;
        const wave3 = Math.sin(2 * Math.PI * 0.7 * t) * 0.06;
        const noise = (Math.random() * 2 - 1) * 0.02;
        
        data[i] = wave1 + wave2 + wave3 + noise;
      }
    }
    
    this.soundBuffers.backgroundMusic = buffer;
  }

  /**
   * Play background music
   */
  playBackgroundMusic() {
    if (!this.isInitialized || this.isMuted || !this.audioContext) return;
    
    this.stopBackgroundMusic();
    
    try {
      // Generate music if not already done
      if (!this.soundBuffers.backgroundMusic) {
        this.generateBackgroundMusic();
      }
      
      if (this.soundBuffers.backgroundMusic) {
        this.currentMusic = this.audioContext.createBufferSource();
        this.currentMusic.buffer = this.soundBuffers.backgroundMusic;
        this.currentMusic.loop = true;
        this.currentMusic.connect(this.musicGain);
        this.currentMusic.start();
      }
      
    } catch (error) {
      console.warn('Error playing background music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.currentMusic) {
      try {
        this.currentMusic.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.currentMusic = null;
    }
  }

  /**
   * Play countdown beep
   */
  playCountdownBeep() {
    this.playSoundEffect('countdownBeep');
  }

  /**
   * Play start sound
   */
  playStartSound() {
    this.playSoundEffect('startSound');
  }

  /**
   * Play splash sound (when rowing) - uses HTML Audio for better control
   */
  playSplash() {
    // Try HTML audio first, fallback to generated sound
    if (this.htmlAudioElements.splash) {
      this.playSplashSound();
    } else {
      this.playSoundEffect('splashGenerated');
    }
  }

  /**
   * Play victory sound
   */
  playVictory() {
    this.stopBackgroundMusic();
    this.playSoundEffect('victory');
  }

  /**
   * Play button click sound
   */
  playButtonClick() {
    this.playSoundEffect('buttonClick');
  }

  /**
   * Set splash sound cooldown (in milliseconds)
   */
  setSplashCooldown(cooldown) {
    this.splashCooldown = Math.max(50, cooldown); // Minimum 50ms
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
    }
    
    // Update HTML audio elements volume
    if (this.sounds.backgroundMusic) {
      this.sounds.backgroundMusic.volume = this.musicVolume;
    }
    if (this.sounds.victoryMusic) {
      this.sounds.victoryMusic.volume = this.musicVolume;
    }
  }

  /**
   * Set sound effects volume
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
    }
    
    // Update HTML audio elements volume
    if (this.htmlAudioElements.splash) {
      this.htmlAudioElements.splash.volume = this.sfxVolume;
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    
    // Update HTML audio elements
    Object.values(this.htmlAudioElements).forEach(audio => {
      if (audio) {
        audio.muted = this.isMuted;
      }
    });
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      // Resume background music if game is playing
      const gameState = this.gameManager.getGameState();
      if (gameState.current === 'playing') {
        this.playBackgroundMusic();
      }
    }
    
    console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Get mute status
   */
  isMutedStatus() {
    return this.isMuted;
  }

  /**
   * Resume audio context (required for some browsers)
   */
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Game state change handlers
   */
  onGameReady() {
    // Only try to resume if AudioContext exists and user has interacted
    if (this.audioContext && this.userInteractionReceived) {
      this.resumeAudioContext();
    }
  }

  onGameStart() {
    this.playStartSound();
    setTimeout(() => {
      this.playBackgroundMusic();
    }, 500);
  }

  onGameWin() {
    this.playVictory();
  }

  onGameRestart() {
    this.stopBackgroundMusic();
    this.lastSplashTime = 0; // Reset splash timing
  }

  onButtonClick() {
    this.playButtonClick();
  }

  onCountdownTick() {
    this.playCountdownBeep();
  }

  onBoatMove() {
    // Play splash sound with controlled frequency
    this.playSplash();
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopBackgroundMusic();
    
    // Stop all HTML audio elements
    Object.values(this.htmlAudioElements).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    console.log('Audio Manager destroyed');
  }
};