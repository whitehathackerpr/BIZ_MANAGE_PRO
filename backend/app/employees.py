from flask import Blueprint
from app.routes.roles import *  # Using roles.py since there's no employees.py

bp = Blueprint('employees', __name__) 