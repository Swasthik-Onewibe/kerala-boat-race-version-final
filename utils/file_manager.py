import os
from flask import current_app, session
from werkzeug.utils import secure_filename
from utils.helpers import allowed_file

# Global variables (these might get reset on server restart)
current_logo = None
current_music = None

def save_uploaded_file(file, file_type='logo'):
    """Save uploaded file and return the path"""
    global current_logo, current_music
    
    if file and file.filename != '':
        if allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], f'{file_type}_{filename}')
            
            # Ensure upload directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            relative_path = f'uploads/{file_type}_{filename}'
            
            if file_type == 'logo':
                current_logo = relative_path
                # Also store in session for persistence
                session['current_logo'] = relative_path
                print(f"📸 Logo saved: {current_logo}")
            elif file_type == 'music':
                current_music = relative_path
                # Also store in session for persistence
                session['current_music'] = relative_path
                print(f"🎵 Music saved: {current_music}")
            
            return relative_path
        else:
            raise ValueError(f'Invalid {file_type} file type')
    
    return None

def get_file_if_exists(file_path):
    """Check if file exists and return path if it does"""
    if not file_path:
        return None
        
    try:
        # Handle relative paths
        if file_path.startswith('uploads/'):
            full_path = os.path.join(current_app.static_folder, file_path)
        else:
            full_path = os.path.join(current_app.static_folder, 'uploads', file_path)
        
        print(f"🔍 Checking file existence: {full_path}")
        
        if os.path.exists(full_path):
            print(f"✅ File exists: {file_path}")
            return file_path
        else:
            print(f"❌ File not found: {full_path}")
            return None
            
    except Exception as e:
        print(f"❌ Error checking file: {e}")
        return None

def get_current_files():
    """Get current logo and music files with session fallback"""
    global current_logo, current_music
    
    # Try to get from global variables first
    logo = current_logo
    music = current_music
    
    # If global variables are None, try to get from session
    if logo is None and 'current_logo' in session:
        logo = session['current_logo']
        current_logo = logo
        print(f"🔄 Restored logo from session: {logo}")
    
    if music is None and 'current_music' in session:
        music = session['current_music']
        current_music = music
        print(f"🔄 Restored music from session: {music}")
    
    return logo, music

def clear_current_files():
    """Clear current file references"""
    global current_logo, current_music
    current_logo = None
    current_music = None
    
    # Also clear from session
    session.pop('current_logo', None)
    session.pop('current_music', None)
    print("🧹 Current files cleared")

def initialize_from_session():
    """Initialize global variables from session on app start"""
    global current_logo, current_music
    
    if 'current_logo' in session:
        current_logo = session['current_logo']
        print(f"🔄 Initialized logo from session: {current_logo}")
    
    if 'current_music' in session:
        current_music = session['current_music']
        print(f"🔄 Initialized music from session: {current_music}")

def get_latest_uploaded_files():
    """Get the most recently uploaded files by scanning the upload directory"""
    try:
        upload_dir = os.path.join(current_app.static_folder, 'uploads')
        if not os.path.exists(upload_dir):
            return None, None
        
        logo_files = []
        music_files = []
        
        for filename in os.listdir(upload_dir):
            if filename.startswith('logo_'):
                logo_files.append(filename)
            elif filename.startswith('music_'):
                music_files.append(filename)
        
        # Get the most recent files
        latest_logo = None
        latest_music = None
        
        if logo_files:
            latest_logo = f"uploads/{max(logo_files, key=lambda x: os.path.getmtime(os.path.join(upload_dir, x)))}"
        
        if music_files:
            latest_music = f"uploads/{max(music_files, key=lambda x: os.path.getmtime(os.path.join(upload_dir, x)))}"
        
        print(f"📂 Latest files found - Logo: {latest_logo}, Music: {latest_music}")
        return latest_logo, latest_music
        
    except Exception as e:
        print(f"❌ Error scanning for latest files: {e}")
        return None, None