# Import functions lazily to avoid circular dependencies
__all__ = [
    'generate_password_reset_token',
    'verify_password_reset_token',
    'send_password_reset_email',
    'rate_limit'
]

# These functions will be imported when needed
def generate_password_reset_token(user_id):
    from .auth import generate_password_reset_token as gen_token
    return gen_token(user_id)

def verify_password_reset_token(token):
    from .auth import verify_password_reset_token as verify_token
    return verify_token(token)

def send_password_reset_email(email, reset_url):
    from .email import send_password_reset_email as send_email
    return send_email(email, reset_url)

def rate_limit(*args, **kwargs):
    from .rate_limiting import rate_limit as rate_limiter
    return rate_limiter(*args, **kwargs) 