from flask import Blueprint
from app.routes.inventory import *

bp = Blueprint('inventory', __name__) 