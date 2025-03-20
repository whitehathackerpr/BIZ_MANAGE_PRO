from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from app import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # ... other fields ... 