
from flask import Blueprint, render_template, request, jsonify, current_app
from utils.file_manager import current_logo, current_music, save_uploaded_file
from utils.file_manager import get_current_files

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin', methods=['GET'])
def admin():
    return render_template('admin.html')

@admin_bp.route('/save-settings', methods=['POST'])
def save_settings():
    print("🔍 Upload route called")
    print(f"   Request files: {request.files}")
    
    response_data = {}

    try:
        # Handle logo upload
        if 'logo' in request.files:
            logo_file = request.files['logo']
            print(f"📸 Logo file received: {logo_file.filename}")
            if logo_file and logo_file.filename != '':
                logo_path = save_uploaded_file(logo_file, 'logo')
                if logo_path:
                    response_data['logo_uploaded'] = True
                    response_data['logo_path'] = logo_path
                    print(f"✅ Logo uploaded successfully: {logo_path}")
                else:
                    print("❌ Logo upload failed")
            else:
                print("⚠️ No logo file provided")
        
        # Handle music upload
        if 'music' in request.files:
            music_file = request.files['music']
            print(f"🎵 Music file received: {music_file.filename}")
            if music_file and music_file.filename != '':
                music_path = save_uploaded_file(music_file, 'music')
                if music_path:
                    response_data['music_uploaded'] = True
                    response_data['music_path'] = music_path
                    print(f"✅ Music uploaded successfully: {music_path}")
                else:
                    print("❌ Music upload failed")
            else:
                print("⚠️ No music file provided")
        
        # Get actual values from session-aware helper
        logo_after, music_after = get_current_files()
        print(f"   Current logo after upload: {logo_after}")
        print(f"   Current music after upload: {music_after}")
        
        
        response_data['success'] = True
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Upload error: {e}")
        # After all processing
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/get-settings', methods=['GET'])
def get_settings():
    try:
        # Get relative file paths (e.g., "uploads/logo_IMG_-0141.jpg")
        logo_path, music_path = get_current_files()
        print("🔍 get_current_files returned:", logo_path, music_path)


        def normalize(path):
            if path:
                # Remove any leading slashes just in case
                return f'/static/{path.lstrip("/")}'
            return None

        settings = {
            'logoUrl': normalize(logo_path),
            'musicUrl': normalize(music_path)
        }

        return jsonify(settings)

    except Exception as e:
        print(f"❌ Error in get-settings: {e}")
        return jsonify({'error': str(e)}), 500

