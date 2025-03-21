from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, DecimalField, IntegerField, SelectField
from wtforms.validators import DataRequired, Length, Optional, NumberRange
from flask_wtf.file import FileField, FileAllowed

class ProductForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=128)])
    slug = StringField('Slug', validators=[DataRequired(), Length(max=128)])
    sku = StringField('SKU', validators=[DataRequired(), Length(max=32)])
    description = TextAreaField('Description')
    price = DecimalField('Price', validators=[DataRequired(), NumberRange(min=0)])
    cost = DecimalField('Cost', validators=[Optional(), NumberRange(min=0)])
    stock = IntegerField('Stock', validators=[DataRequired(), NumberRange(min=0)])
    reorder_point = IntegerField('Reorder Point', validators=[Optional(), NumberRange(min=0)])
    category_id = SelectField('Category', coerce=int, validators=[Optional()])
    status = SelectField('Status', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('discontinued', 'Discontinued')
    ])
    images = FileField('Images', validators=[
        FileAllowed(['jpg', 'jpeg', 'png'], 'Images only!')
    ])

class CategoryForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=64)])
    slug = StringField('Slug', validators=[DataRequired(), Length(max=64)])
    description = TextAreaField('Description')
    parent_id = SelectField('Parent Category', coerce=int, validators=[Optional()]) 