from flask import request
from math import ceil

def paginate(query, per_page=20):
    """Generic pagination utility for SQLAlchemy queries"""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', per_page))
    
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'items': items,
        'total': total,
        'page': page,
        'pages': ceil(total / per_page),
        'per_page': per_page
    } 