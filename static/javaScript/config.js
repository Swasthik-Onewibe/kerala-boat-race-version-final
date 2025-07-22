window.KeralaBRace = window.KeralaBRace || {};

// Main game configuration
window.KeralaBRace.CONFIG = {
  // Game settings
  RACE_DISTANCE: 150, // donot change 150
  BOAT_SPEED: 0.4,
  FINISH_LINE_Z: 75,
  START_POSITION_Z: -75,
  
  // Boat settings
  BOAT_1_X: -9,
  BOAT_2_X: 10,
  BOAT_BASE_Y: 10,
  BOAT_SCALE: 20,
  
  // Water settings
  WATER_WIDTH: 50,
  WATER_LENGTH: 500,
  WATER_SEGMENTS: 150,
  WATER_COLOR: 0x006994,
  WATER_OPACITY: 0.8,
  
  // River settings
  RIVER_WIDTH: 50,
  BANK_WIDTH: 95,
  RIVER_LENGTH: 250,
  LAND_COLOR: 0x228B22,
  
  // Animation settings
  WAVE_AMPLITUDE: 0.3,
  WAVE_FREQUENCY: 0.01,
  ROTATION_AMPLITUDE: 0.05,
  
  // Camera settings
  CAMERA_FOV: 60,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 900,
  CAMERA_POSITION: { x: 0, y: 70, z: -20 },
  CAMERA_OFFSET_Z: -30,
  
  // Lighting
  AMBIENT_LIGHT_COLOR: 0x404040,
  AMBIENT_LIGHT_INTENSITY: 0.6,
  DIRECTIONAL_LIGHT_COLOR: 0xffffff,
  DIRECTIONAL_LIGHT_INTENSITY: 0.8,
  DIRECTIONAL_LIGHT_POSITION: { x: 50, y: 50, z: 50 },
  
  // Scene settings
  SCENE_FOG_COLOR: 0x87ceeb,
  SCENE_FOG_NEAR: 50,
  SCENE_FOG_FAR: 200,
  SCENE_CLEAR_COLOR: 0x87ceeb,
  
  // Controls
  PLAYER_1_KEY: 'w',
  PLAYER_2_KEY: 'ArrowUp',
  
  // File paths
  MODELS: {
    SNAKE_BOAT: 'static/models/Kerala_Snake_Boat.glb',
    PALM_TREES: 'static/models/palm_trees.glb',
    GROUND_GRASS: 'static/models/grass.glb',
    CLOUDS:'static/models/cloud_test.glb',
    WATER_MODEL_PATH:'static/models/water_animation.glb',
    OAK_TREES:'static/models/mighty_oak_trees.glb',
  },
  
  TEXTURES: {
    WAVE_OVERLAY: 'lib/wavecut.png'
  },
  
  // Debug
  DEBUG_MODE: false
};

// Color schemes
window.KeralaBRace.COLORS = {
  BOAT_1: 0xcc0000,  // Red
  BOAT_2: 0x00ff00,  // Green
  LAND: 0x228B22,
  WHITE: 0xffffff,
  RED: 0xff0000,
  SKY: 0x87ceeb
};

// Game states
window.KeralaBRace.GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

window.KeralaBRace.AUDIO_FILES = {
  splash: '/static/audio/water-splash-147014.mp3' // Adjust path based on your folder
};