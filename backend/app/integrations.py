from flask import Blueprint
from app.routes.websocket import *  # Using websocket.py for integrations

bp = Blueprint('integrations', __name__) 