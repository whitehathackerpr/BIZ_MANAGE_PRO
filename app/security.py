from functools import wraps
import os
from flask import current_app, redirect, request, abort, url_for, session
from flask_login import current_user
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import pyotp
import qrcode
import io
import base64

class Security:
    @staticmethod
    def generate_password_hash(password):
        return generate_password_hash(password, method='pbkdf2:sha256:100000')

    @staticmethod
    def check_password(hashed_password, password):
        return check_password_hash(hashed_password, password)

    @staticmethod
    def generate_token(user_id, expires_in=3600):
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow()
        }
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )

    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def generate_2fa_secret():
        return pyotp.random_base32()

    @staticmethod
    def generate_2fa_qr_code(secret, email):
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            email,
            issuer_name="Business Management System"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    @staticmethod
    def verify_2fa_token(secret, token):
        totp = pyotp.TOTP(secret)
        return totp.verify(token)

def require_2fa(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            abort(401)
        
        if current_user.requires_2fa and not session.get('2fa_verified'):
            return redirect(url_for('auth.verify_2fa'))
        
        return f(*args, **kwargs)
    return decorated_function

def rate_limit(limit=100, per=60):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            key = f'rate_limit:{request.remote_addr}:{f.__name__}'
            try:
                remaining = current_app.redis.get(key)
                if remaining is None:
                    current_app.redis.setex(key, per, limit - 1)
                elif int(remaining) <= 0:
                    abort(429)
                else:
                    current_app.redis.decr(key)
            except:
                # If Redis is unavailable, continue without rate limiting
                current_app.logger.warning('Rate limiting unavailable')
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

class CSRFProtect:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        app.config.setdefault('CSRF_ENABLED', True)
        app.config.setdefault('CSRF_SECRET', app.config['SECRET_KEY'])
        
        @app.before_request
        def csrf_protect():
            if not app.config['CSRF_ENABLED']:
                return
            
            if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
                token = request.headers.get('X-CSRF-Token')
                if not token or not self.verify_csrf_token(token):
                    abort(403)

    def generate_csrf_token(self):
        if 'csrf_token' not in session:
            session['csrf_token'] = self.generate_token()
        return session['csrf_token']

    def verify_csrf_token(self, token):
        return token == session.get('csrf_token')

    @staticmethod
    def generate_token():
        return base64.b64encode(os.urandom(32)).decode('utf-8') 