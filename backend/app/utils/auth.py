from itsdangerous import URLSafeTimedSerializer
from flask import current_app

def generate_password_reset_token(user):
    """Generate a password reset token for a user."""
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return s.dumps(user.email, salt='password-reset-salt')

def verify_password_reset_token(token):
    """Verify a password reset token and return the user."""
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = s.loads(token, salt='password-reset-salt', max_age=3600)
    except:
        return None
    return User.query.filter_by(email=email).first() 