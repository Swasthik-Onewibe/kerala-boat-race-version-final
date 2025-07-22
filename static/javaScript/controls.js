export class Controls {
  constructor(config) {
    this.config = config;
    this.keys = {};
    this.touchZones = [];
    this.initEventListeners();
  }

  initEventListeners() {
    // Keyboard event listeners
    document.addEventListener("keydown", (event) => {
      this.keys[event.key] = true;
      event.preventDefault(); // Prevent default browser behavior
    });

    document.addEventListener("keyup", (event) => {
      this.keys[event.key] = false;
      event.preventDefault();
    });

  }

  isPlayer1Moving() {
    return this.keys['a'] || this.keys['A'];
  }

  isPlayer2Moving() {
    return this.keys['b']|| this.keys['B'];
  }

  // Clean up touch controls
  cleanup() {
    this.touchZones.forEach(zone => {
      if (zone && zone.parentNode) {
        zone.parentNode.removeChild(zone);
      }
    });
    this.touchZones = [];
  }

  // Method to get current input state
  getInputState() {
    return {
      player1: this.isPlayer1Moving(),
      player2: this.isPlayer2Moving(),
      keys: { ...this.keys }
    };
  }

  // Method to simulate input (useful for AI or testing)
  simulateInput(player, active) {
    if (player === 1) {
      this.keys['a'] = active;
    } else if (player === 2) {
      this.keys['b'] = active;
    }
  }
}