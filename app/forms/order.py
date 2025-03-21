from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, DecimalField, FieldList, FormField, IntegerField, BooleanField
from wtforms.validators import DataRequired, Optional, NumberRange

class OrderItemForm(FlaskForm):
    product_id = StringField('Product', validators=[DataRequired()])
    variant_id = StringField('Variant', validators=[Optional()])
    quantity = IntegerField('Quantity', validators=[
        DataRequired(),
        NumberRange(min=1, message='Quantity must be at least 1')
    ])

class OrderForm(FlaskForm):
    shipping_address_id = SelectField('Shipping Address', coerce=int, 
                                    validators=[DataRequired()])
    billing_address_id = SelectField('Billing Address', coerce=int, 
                                   validators=[DataRequired()])
    shipping_method = SelectField('Shipping Method', validators=[DataRequired()])
    shipping_cost = DecimalField('Shipping Cost', validators=[
        DataRequired(),
        NumberRange(min=0)
    ])
    notes = TextAreaField('Order Notes')
    items = FieldList(FormField(OrderItemForm), min_entries=1)

class AddressForm(FlaskForm):
    name = StringField('Full Name', validators=[DataRequired()])
    street = StringField('Street Address', validators=[DataRequired()])
    city = StringField('City', validators=[DataRequired()])
    state = StringField('State/Province', validators=[DataRequired()])
    postal_code = StringField('Postal Code', validators=[DataRequired()])
    country = SelectField('Country', validators=[DataRequired()])
    phone = StringField('Phone Number', validators=[Optional()])
    is_default = BooleanField('Set as Default Address') 