from flask import Blueprint
from flask_restx import Api
from .routes import ns

bp = Blueprint('auth', __name__)
api = Api(bp)

# Add the namespace to the API
api.add_namespace(ns)

# Import routes after blueprint creation to avoid circular imports
from . import routes 