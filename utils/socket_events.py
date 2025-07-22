from flask_socketio import emit
from flask import request
from utils.helpers import save_player_data
import datetime

def register_socket_events(socketio):
    
    @socketio.on('game_start')
    def handle_game_start(data):
        print(f"🎮 Game starting with players: {data}")
        print(f"📤 Broadcasting game_start event to all clients")
        
        # Save player data to CSV
        data['timestamp'] = datetime.datetime.now().isoformat()
        save_player_data(data)
        
        # Broadcast to all clients
        socketio.emit('game_start', data)
        print(f"✅ Broadcast complete")
    
    @socketio.on('game_restart')
    def handle_game_restart(data):
        print(f"🔄 Game restart requested: {data}")
        print(f"📤 Broadcasting game_restart event to all clients")
        
        # Broadcast restart event to all connected clients
        socketio.emit('game_restart', data)
        print(f"✅ Game restart broadcast complete")
    
    @socketio.on('save_player_data')
    def handle_save_player_data(data):
        print(f"💾 Saving player data to CSV: {data}")
        save_player_data(data)
        print(f"✅ Player data saved successfully")
    
    @socketio.on('connect')
    def handle_connect(auth):
        print(f'🔗 Client connected from: {request.remote_addr}')
        print(f'📊 Socket ID: {request.sid}')
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print(f'❌ Client disconnected: {request.sid}')
    
    @socketio.on('debug_ping')
    def handle_debug_ping(data):
        print(f'🏓 Debug ping received: {data}')
        emit('debug_pong', {'message': 'Server received ping'}, broadcast=True)