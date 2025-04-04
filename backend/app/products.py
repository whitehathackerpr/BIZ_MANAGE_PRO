from flask import Blueprint
from app.routes.products import *

bp = Blueprint('products', __name__) 