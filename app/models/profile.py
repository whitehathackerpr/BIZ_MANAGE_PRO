from app import db
from datetime import datetime

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company_name = db.Column(db.String(128))
    bio = db.Column(db.Text)
    website = db.Column(db.String(256))
    avatar_url = db.Column(db.String(256))
    phone = db.Column(db.String(32))
    timezone = db.Column(db.String(64))
    language = db.Column(db.String(8), default='en')
    notification_preferences = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserAddress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(32))  # shipping, billing
    name = db.Column(db.String(128), nullable=False)
    company = db.Column(db.String(128))
    street = db.Column(db.String(256), nullable=False)
    city = db.Column(db.String(128), nullable=False)
    state = db.Column(db.String(128), nullable=False)
    postal_code = db.Column(db.String(32), nullable=False)
    country = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(32))
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 