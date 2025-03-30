from flask import Blueprint

bp = Blueprint('main', __name__)

# Import routes after blueprint creation to avoid circular imports
from . import routes 