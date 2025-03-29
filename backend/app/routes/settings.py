from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from app.models import db, User, Business, SystemSetting
from app.utils.auth import login_required, get_current_user
from app.utils.email import send_email

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/users/me', methods=['GET'])
@login_required
def get_user_profile():
    try:
        user = get_current_user()
        return jsonify({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': user.phone,
            'avatar_url': user.avatar_url,
            'created_at': user.created_at.isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/users/me', methods=['PUT'])
@login_required
def update_user_profile():
    try:
        user = get_current_user()
        data = request.get_json()

        # Update basic info
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.phone = data.get('phone', user.phone)

        # Handle password change if provided
        if data.get('current_password') and data.get('new_password'):
            if user.check_password(data['current_password']):
                user.set_password(data['new_password'])
            else:
                return jsonify({'error': 'Current password is incorrect'}), 400

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/users/avatar', methods=['POST'])
@login_required
def upload_avatar():
    try:
        if 'avatar' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{timestamp}_{filename}"
            
            # Ensure upload directory exists
            upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'avatars')
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, unique_filename)
            file.save(file_path)
            
            # Update user's avatar URL
            user = get_current_user()
            user.avatar_url = f"/uploads/avatars/{unique_filename}"
            db.session.commit()
            
            return jsonify({
                'message': 'Avatar uploaded successfully',
                'avatar_url': user.avatar_url
            })
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/business', methods=['GET'])
@login_required
def get_business_settings():
    try:
        business = Business.query.first()
        if not business:
            return jsonify({'error': 'Business settings not found'}), 404
            
        return jsonify({
            'business_name': business.name,
            'address': business.address,
            'city': business.city,
            'state': business.state,
            'zip_code': business.zip_code,
            'country': business.country,
            'phone': business.phone,
            'email': business.email,
            'tax_id': business.tax_id,
            'currency': business.currency,
            'timezone': business.timezone
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/business', methods=['PUT'])
@login_required
def update_business_settings():
    try:
        business = Business.query.first()
        if not business:
            business = Business()
            db.session.add(business)

        data = request.get_json()
        business.name = data.get('business_name', business.name)
        business.address = data.get('address', business.address)
        business.city = data.get('city', business.city)
        business.state = data.get('state', business.state)
        business.zip_code = data.get('zip_code', business.zip_code)
        business.country = data.get('country', business.country)
        business.phone = data.get('phone', business.phone)
        business.email = data.get('email', business.email)
        business.tax_id = data.get('tax_id', business.tax_id)
        business.currency = data.get('currency', business.currency)
        business.timezone = data.get('timezone', business.timezone)

        db.session.commit()
        return jsonify({'message': 'Business settings updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/system', methods=['GET'])
@login_required
def get_system_settings():
    try:
        user = get_current_user()
        settings = SystemSetting.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = SystemSetting(user_id=user.id)
            db.session.add(settings)
            db.session.commit()

        return jsonify({
            'dark_mode': settings.dark_mode,
            'email_notifications': settings.email_notifications,
            'two_factor_auth': settings.two_factor_auth
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/system', methods=['PUT'])
@login_required
def update_system_settings():
    try:
        user = get_current_user()
        settings = SystemSetting.query.filter_by(user_id=user.id).first()
        if not settings:
            settings = SystemSetting(user_id=user.id)
            db.session.add(settings)

        data = request.get_json()
        settings.dark_mode = data.get('dark_mode', settings.dark_mode)
        settings.email_notifications = data.get('email_notifications', settings.email_notifications)
        settings.two_factor_auth = data.get('two_factor_auth', settings.two_factor_auth)

        db.session.commit()
        return jsonify({'message': 'System settings updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/users/me', methods=['DELETE'])
@login_required
def delete_account():
    try:
        user = get_current_user()
        
        # Send confirmation email
        send_email(
            subject="Account Deletion Confirmation",
            recipients=[user.email],
            body="Your account has been successfully deleted. We're sorry to see you go!"
        )
        
        # Delete user's data
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Account deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS 