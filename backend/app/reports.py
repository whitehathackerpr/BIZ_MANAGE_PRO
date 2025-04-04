from flask import Blueprint
from app.routes.analytics import *  # Using analytics.py since there's no reports.py

bp = Blueprint('reports', __name__) 