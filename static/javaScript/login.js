// Add this to the top of your login.js file temporarily for debugging
console.log("🔥 LOGIN.JS FILE LOADED - NEW VERSION");

// Add this test function at the bottom of login.js
function testSocketConnection() {
    console.log("Testing socket connection...");
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);
    
    // Test emit
    socket.emit('debug_ping', {test: 'hello from login page'});
    
    // Listen for response
    socket.on('debug_pong', (data) => {
        console.log("✅ Received pong:", data);
    });
}

// Make it globally available
window.testSocketConnection = testSocketConnection;

function validateForm() {
  const skip = document.getElementById("skipLogin").checked;

  if (skip) {
    return true; // Allow skip
  }

  // Validate at least one player has both name and phone
  let hasValidPlayer = false;

  for (let i = 1; i <= 2; i++) {
    const name = document
      .querySelector(`input[name="player${i}_name"]`)
      .value.trim();
    const phone = document
      .querySelector(`input[name="player${i}_phone"]`)
      .value.trim();

    if (name && phone) {
      hasValidPlayer = true;
    }

    // If phone is provided, validate it
    if (phone && !/^\d{10}$/.test(phone)) {
      showCustomAlert(`Player ${i} phone number must be 10 digits`);
      return false;
    }
  }

  if (!hasValidPlayer && !skip) {
    showCustomAlert(
      "Please enter at least one player with both name and phone number, or check 'Skip Login' to use default names"
    );
    return false;
  }

  return true;
}

function showCustomAlert(message) {
  document.getElementById("customAlertMessage").innerText = message;
  document.getElementById("customAlert").style.display = "flex";
}

function closeCustomAlert() {
  document.getElementById("customAlert").style.display = "none";
}

function resetForm() {
  document.getElementById("loginForm").reset();
  updateStatusMessage("Ready to start game...");
}

function restartGame() {
  console.log("🔄 Restart game button clicked");
  
  if (typeof socket === 'undefined') {
    console.error('❌ Socket not found!');
    showCustomAlert("Connection error. Please refresh the page.");
    return;
  }

  console.log("📡 Emitting game_restart event");
  
  // Emit restart event to server
  socket.emit('game_restart', {
    timestamp: new Date().toISOString(),
    source: 'mobile_login'
  });
  
  // Show confirmation message
  showCustomAlert("Game restarted! Laptop will return to intro page.");
  updateStatusMessage("Game restarted - ready for new players...");
  
  // Clear form after restart
  setTimeout(() => {
    document.getElementById("loginForm").reset();
    closeCustomAlert();
  }, 2000);
}

function updateStatusMessage(message) {
  const statusElement = document.getElementById("statusMessage");
  if (statusElement) {
    statusElement.textContent = message;
  }
}

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for socketClient.js to load
    setTimeout(function() {
        if (typeof socket === 'undefined') {
            console.error('❌ Socket not found! Make sure socketClient.js is loaded first');
            return;
        }
        
        console.log('✅ Socket found, setting up login form listener');
        setupFormListener();
    }, 100);
});

function setupFormListener() {
    document.getElementById("loginForm").addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const form = e.target;
        const formData = new FormData(form);
        const skip = document.getElementById("skipLogin").checked;

        // Extract player data with proper defaults for empty values
        const playerData = {
            player1_name: formData.get("player1_name")?.trim() || "Player 1",
            player2_name: formData.get("player2_name")?.trim() || "Player 2",
            player1_phone: formData.get("player1_phone")?.trim() || "",
            player2_phone: formData.get("player2_phone")?.trim() || "",
            skip: skip
        };

        console.log("🎮 Sending player data:", playerData);
        console.log("📡 Socket connected:", socket.connected);
        console.log("🔌 Socket ID:", socket.id);

        // Emit socket event to notify laptop (intro page)
        socket.emit("game_start", playerData);
        
        // Add confirmation that event was sent
        console.log("✅ Game start event emitted successfully");

        // Show success message and stay on login page
        showCustomAlert("Game started on laptop! You can register more players.");
        updateStatusMessage("Game started! Ready for next players...");
        
        // Optionally clear the form for next players
        setTimeout(() => {
            document.getElementById("loginForm").reset();
            closeCustomAlert();
        }, 3000);
    });
}

// Add connection status logging - but only if socket exists
setTimeout(() => {
    if (typeof socket !== 'undefined') {
        socket.on('connect', () => {
            console.log('✅ Connected to server from login page');
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

        socket.on('game_start', (data) => {
            console.log('🎮 Game start confirmation received on login page:', data);
        });

        socket.on('game_restart', (data) => {
            console.log('🔄 Game restart confirmation received on login page:', data);
        });
    }
}, 200);