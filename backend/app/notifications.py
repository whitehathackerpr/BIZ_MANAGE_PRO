from flask import Blueprint
from app.routes.notifications import *

bp = Blueprint('notifications', __name__) 