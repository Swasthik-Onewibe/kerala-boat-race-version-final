// Intro page logic for laptop waiting screen
document.addEventListener('DOMContentLoaded', function() {
    console.log('Intro page loaded');
    
    // Show waiting message
    displayWaitingMessage();
    
    // Check if we have stored player data (in case of page refresh)
    const storedData = sessionStorage.getItem('playerData');
    if (storedData) {
        console.log('Found stored player data:', storedData);
        const playerData = JSON.parse(storedData);
        hideWaitingMessage();
        startGameWithPlayers(playerData);
    }
    
    // Listen for game start from mobile
    socket.on('game_start', (playerData) => {
        console.log('Game start received on intro page:', playerData);
        hideWaitingMessage();
        startGameWithPlayers(playerData);
    });
});

function displayWaitingMessage() {
    console.log('Displaying waiting message');
    
    // Remove existing waiting message if any
    const existing = document.getElementById('waitingMessage');
    if (existing) {
        existing.remove();
    }
    
    // Show "Waiting for players to register on mobile..." message
    // const waitingDiv = document.createElement('div');
    // waitingDiv.id = 'waitingMessage';
    // waitingDiv.innerHTML = `
    //     <div style="text-align: center; margin-top: 100px; font-family: Arial, sans-serif;">
    //         <h2 style="color: #333;">Waiting for players...</h2>
    //         <p style="color: #666; font-size: 18px; margin: 20px 0;">
    //             Please open <strong style="color: #007bff;">http://192.168.29.111:5000/login</strong> 
    //             on your mobile device to register players and start the game.
    //         </p>
    //         <div class="spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    //         <p style="color: #999; font-size: 14px; margin-top: 30px;">
    //             Socket Status: <span id="socketStatus">Connecting...</span>
    //         </p>
    //     </div>
    //     <style>
    //         @keyframes spin {
    //             0% { transform: rotate(0deg); }
    //             100% { transform: rotate(360deg); }
    //         }
    //     </style>
    // `;
    // document.body.appendChild(waitingDiv);
    
    // Update socket status
    updateSocketStatus();
}

function updateSocketStatus() {
    const statusElement = document.getElementById('socketStatus');
    if (statusElement) {
        if (socket.connected) {
            statusElement.textContent = 'Connected ✓';
            statusElement.style.color = 'green';
        } else {
            statusElement.textContent = 'Disconnected ✗';
            statusElement.style.color = 'red';
        }
    }
    
    // Update every 2 seconds
    setTimeout(updateSocketStatus, 2000);
}

function hideWaitingMessage() {
    console.log('Hiding waiting message');
    const waitingDiv = document.getElementById('waitingMessage');
    if (waitingDiv) {
        waitingDiv.remove();
    }
}

function startGameWithPlayers(playerData) {
    console.log('Starting game with players:', playerData);
    
    // Set player names
    window.playerNames = [
        playerData.player1_name || 'Player 1',
        playerData.player2_name || 'Player 2', 
    ];
    
    console.log('Player names set:', window.playerNames);
    
    // The redirect will happen automatically via socketClient.js
    // But let's add a fallback in case it doesn't work
    setTimeout(() => {
        if (window.location.pathname === '/') {
            console.log('Fallback redirect triggered');
            const params = new URLSearchParams();
            params.append('player1_name', playerData.player1_name || 'Player 1');
            params.append('player2_name', playerData.player2_name || 'Player 2');
            if (playerData.skip) params.append('skip', 'true');
            
            window.location.href = '/game?' + params.toString();
        }
    }, 1000);
}