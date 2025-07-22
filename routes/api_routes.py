from flask import Blueprint, render_template, current_app, jsonify,request
import os
from config import Config

api_bp = Blueprint('api', __name__)

@api_bp.route('/export-data')
def export_data():
    """Render export page with download button"""
    return render_template('exportpage.html')

@api_bp.route('/download-data', methods=['GET'])
def download_data():
    """Export CSV data for download"""
    if os.path.exists(Config.CSV_DATA_FILE):
        with open(Config.CSV_DATA_FILE, 'r', encoding='utf-8') as f:
            csv_data = f.read()
        
        response = current_app.response_class(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=player_data.csv'}
        )
        return response
    else:
        # Return 200 with JSON indicating no file
        return jsonify({
            'success': False,
            'message': 'No data file found.'
        }), 200


# Add this route to your Flask app (make sure it's in the correct blueprint)
@api_bp.route('/delete-file', methods=['POST', 'GET'])
def delete_file():
    print(f"Delete route reached. Method: {request.method}")
    print(f"CSV_DATA_FILE path: {Config.CSV_DATA_FILE}")
    print(f"File exists: {os.path.exists(Config.CSV_DATA_FILE)}")
    
    try:
        if request.method == 'POST':
            # Handle AJAX POST request
            if os.path.exists(Config.CSV_DATA_FILE):
                os.remove(Config.CSV_DATA_FILE)
                print("File deleted successfully")
                return jsonify({
                    'success': True,
                    'message': 'The player data CSV file has been successfully removed.'
                })
            else:
                print("File not found")
                return jsonify({
                    'success': False,
                    'error': 'No data file found.'
                }), 404
        else:
            # Handle GET request (render template)
            if os.path.exists(Config.CSV_DATA_FILE):
                os.remove(Config.CSV_DATA_FILE)
                return render_template(
                    'delete_page.html',
                    message="The player data CSV file has been successfully removed.",
                    status="success"
                )
            else:
                return render_template(
                    'delete_page.html',
                    message="No data file found.",
                    status="error"
                )
    except Exception as e:
        print(f"Error in delete_file route: {e}")
        if request.method == 'POST':
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
        else:
            return render_template(
                'delete_page.html',
                message=f"Error: {str(e)}",
                status="error"
            )

