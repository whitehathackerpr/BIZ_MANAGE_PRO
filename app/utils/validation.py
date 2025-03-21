from marshmallow import Schema, ValidationError, fields, validates_schema
from functools import wraps
from flask import request
from .errors import APIError

def validate_schema(schema_cls):
    """Decorator to validate request data against a schema"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            schema = schema_cls()
            try:
                if request.is_json:
                    data = schema.load(request.get_json())
                else:
                    data = schema.load(request.form.to_dict())
                return f(*args, validated_data=data, **kwargs)
            except ValidationError as err:
                raise APIError('Validation error', payload=err.messages)
        return decorated_function
    return decorator

class PaginationSchema(Schema):
    """Schema for pagination parameters"""
    page = fields.Integer(missing=1, validate=lambda n: n > 0)
    per_page = fields.Integer(missing=20, validate=lambda n: 0 < n <= 100)

class DateRangeSchema(Schema):
    """Schema for date range parameters"""
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)

    @validates_schema
    def validate_dates(self, data, **kwargs):
        if data['start_date'] > data['end_date']:
            raise ValidationError('start_date must be before end_date')