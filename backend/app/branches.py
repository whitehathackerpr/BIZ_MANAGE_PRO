from flask import Blueprint
from app.routes.branch import *

bp = Blueprint('branches', __name__)