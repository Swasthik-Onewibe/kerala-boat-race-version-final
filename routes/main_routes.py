from flask import Blueprint, render_template, request, jsonify, url_for
import datetime
from utils.helpers import save_player_data




main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET'])
def intro_game():
    return render_template('intro.html')

@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Handle form submission via AJAX, don't redirect
        return jsonify({'success': True, 'message': 'Players registered!'})
    
    return render_template('login.html')

@main_bp.route('/game', methods=['GET'])
def game():
    from utils.file_manager import (
        current_logo, current_music, get_file_if_exists, 
        get_current_files, initialize_from_session, 
        get_latest_uploaded_files
    )
    
    print("🎮 Game route called")
    
    # Initialize from session if global variables are None
    initialize_from_session()
    
    # Get current files with session fallback
    logo_path, music_path = get_current_files()
    
    print(f"🔍 After session restore:")
    print(f"   logo_path: {logo_path}")
    print(f"   music_path: {music_path}")
    
    # If still None, try to find the latest uploaded files
    if logo_path is None or music_path is None:
        print("🔍 Trying to find latest uploaded files...")
        latest_logo, latest_music = get_latest_uploaded_files()
        
        if logo_path is None and latest_logo:
            logo_path = latest_logo
        if music_path is None and latest_music:
            music_path = latest_music
            
        print(f"🔍 After latest file search:")
        print(f"   logo_path: {logo_path}")
        print(f"   music_path: {music_path}")
    
    # Check if files actually exist
    logo_to_display = get_file_if_exists(logo_path)
    music_to_display = get_file_if_exists(music_path)

    # Generate URLs only if files exist
    logo_url = url_for('static', filename=logo_to_display) if logo_to_display else ''
    music_url = url_for('static', filename=music_to_display) if music_to_display else ''
    
    print(f"🔍 Final debug info:")
    print(f"   current_logo: {current_logo}")
    print(f"   current_music: {current_music}")
    print(f"   logo_to_display: {logo_to_display}")
    print(f"   music_to_display: {music_to_display}")
    print(f"   logo_url: {logo_url}")
    print(f"   music_url: {music_url}")
    
    # Get player names with proper defaults
    player1_name = request.args.get('player1_name') or 'Player 1'
    player2_name = request.args.get('player2_name') or 'Player 2'
    
    # Limit length if names are provided
    if len(player1_name) > 20: player1_name = player1_name[:20]
    if len(player2_name) > 20: player2_name = player2_name[:20]
    
    player1_phone = request.args.get('player1_phone', '')
    player2_phone = request.args.get('player2_phone', '')
    skip = request.args.get('skip', 'false').lower() == 'true'
    
    # Save player data to CSV when game starts
    player_data = {
        'player1_name': player1_name,
        'player1_phone': player1_phone,
        'player2_name': player2_name,
        'player2_phone': player2_phone,
        'skip': skip,
        'timestamp': datetime.datetime.now().isoformat()
    }
    
    # Only save if we have actual player data (not just defaults)
    if (player1_name != 'Player 1' or player1_phone or 
        player2_name != 'Player 2' or player2_phone or skip):
        save_player_data(player_data)
        print(f"💾 Player data saved from game route: {player_data}")

    return render_template('game.html', 
                       player1_name=player1_name,
                       player2_name=player2_name,
                       logo_url=logo_url,
                       music_url=music_url)