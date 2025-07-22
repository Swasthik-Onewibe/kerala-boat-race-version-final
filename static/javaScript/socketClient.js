// Automatically uses the same host as the webpage
const socket = io('/', {
    transports: ['polling', 'websocket']
});
window.socket = socket;



// Rest of your socket event handlers remain the same
socket.on('game_start', (data) => {
    console.log('Game start event received:', data);
    console.log('Current pathname:', window.location.pathname);
    
    if (window.location.pathname === '/') {  
        console.log('Redirecting to game page...');
        
        const params = new URLSearchParams();
        
        if (data.player1_name && data.player1_name.trim()) {
            params.append('player1_name', data.player1_name.trim());
        }
        if (data.player2_name && data.player2_name.trim()) {
            params.append('player2_name', data.player2_name.trim());
        }
        if (data.player1_phone && data.player1_phone.trim()) {
            params.append('player1_phone', data.player1_phone.trim());
        }
        if (data.player2_phone && data.player2_phone.trim()) {
            params.append('player2_phone', data.player2_phone.trim());
        }
        if (data.skip) {
            params.append('skip', 'true');
        }
        
        sessionStorage.setItem('playerData', JSON.stringify(data));
        const gameUrl = '/game?' + params.toString();
        console.log('Redirecting to:', gameUrl);
        window.location.href = gameUrl;
    } else {
        console.log('Not on intro page, staying on current page');
    }
});

socket.on('game_restart', (data) => {
    console.log('Game restart event received:', data);
    console.log('Current pathname:', window.location.pathname);
    
    const storedPlayerData = sessionStorage.getItem('playerData');
    if (storedPlayerData) {
        try {
            const playerData = JSON.parse(storedPlayerData);
            console.log('💾 Saving player data before restart:', playerData);
            
            playerData.restart_timestamp = new Date().toISOString();
            socket.emit('save_player_data', playerData);
            
        } catch (error) {
            console.error('Error parsing stored player data:', error);
        }
    }
    
    sessionStorage.removeItem('playerData');
    
    if (window.location.pathname === '/game' || window.location.pathname === '/') {
        console.log('Redirecting to intro page due to game restart...');
        window.location.href = '/';
    } else {
        console.log('Not on game page, staying on current page');
    }
});

socket.on('players_registered', (data) => {
    console.log('Players registered:', data);
});

socket.on('connect', () => {
    console.log('Connected to server');
    console.log('Current page:', window.location.pathname);
    console.log('Connected to:', window.location.host);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

function checkSocketStatus() {
    console.log('Socket connected:', socket.connected);
    console.log('Socket id:', socket.id);
    console.log('Current page:', window.location.pathname);
    console.log('Server host:', window.location.host);
}

window.checkSocketStatus = checkSocketStatus;