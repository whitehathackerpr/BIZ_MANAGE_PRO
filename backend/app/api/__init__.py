from flask import Blueprint

bp = Blueprint('api', __name__)

# Import routes after blueprint creation to avoid circular imports
from . import auth, users, branches, products, orders, sales, inventory, analytics 