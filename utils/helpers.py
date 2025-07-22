import csv
import os
import datetime
from config import Config

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def allowed_image(filename):
    """Check if image file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_IMAGE_EXTENSIONS

def save_data(username, phone):
    """Legacy function - keeping for backward compatibility"""
    file_exists = os.path.exists(Config.CSV_DATA_FILE)
    
    with open(Config.CSV_DATA_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['Player1_Name', 'Player1_Phone', 'Player2_Name', 'Player2_Phone','Skip', 'Timestamp'])
        
        # Write as single player entry
        writer.writerow([username, phone, '', '', '', '', False, datetime.datetime.now().isoformat()])

def save_player_data(player_data):
    """Save complete player data to CSV"""
    file_exists = os.path.exists(Config.CSV_DATA_FILE)
    
    with open(Config.CSV_DATA_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['Player1_Name', 'Player1_Phone', 'Player2_Name', 'Player2_Phone',])
        
        # Write player data row
        writer.writerow([
            player_data.get('player1_name', ''),
            player_data.get('player1_phone', ''),
            player_data.get('player2_name', ''),
            player_data.get('player2_phone', ''),
        ])

