from datetime import datetime, UTC
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.extensions import Base

# Define the association table first
user_role = Table(
    'user_role',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Use string reference for the relationship
    users = relationship('User', secondary='user_role', back_populates='roles')
    
    def __repr__(self):
        return f'<Role {self.name}>'

class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128))
    first_name = Column(String(64))
    last_name = Column(String(64))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    last_login = Column(DateTime)
    
    # Use string reference for the relationship
    roles = relationship('Role', secondary='user_role', back_populates='users')
    branches = relationship('Branch', back_populates='manager')
    sales = relationship('Sale', back_populates='user')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Branch(Base):
    __tablename__ = "branch"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200))
    phone = Column(String(20))
    manager_id = Column(Integer, ForeignKey('user.id'))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    manager = relationship('User', back_populates='branches')
    products = relationship('Product', back_populates='branch')
    employees = relationship('Employee', back_populates='branch')
    
    def __repr__(self):
        return f'<Branch {self.name}>'

class Category(Base):
    __tablename__ = "category"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey('category.id'), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    products = relationship('Product', back_populates='category_obj')
    subcategories = relationship('Category', backref='parent', remote_side=[id])
    
    def __repr__(self):
        return f'<Category {self.name}>'

class Product(Base):
    __tablename__ = "product"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    sku = Column(String(50), unique=True)
    barcode = Column(String(50), unique=True)  # Primary barcode
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    quantity = Column(Integer, default=0)
    min_quantity = Column(Integer, default=0)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    category_id = Column(Integer, ForeignKey('category.id'))
    category = Column(String(50))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch', back_populates='products')
    category_obj = relationship('Category', back_populates='products')
    sale_items = relationship('SaleItem', back_populates='product')
    barcodes = relationship('Barcode', back_populates='product')
    
    def __repr__(self):
        return f'<Product {self.name}>'

class Employee(Base):
    __tablename__ = "employee"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True)
    phone = Column(String(20))
    position = Column(String(50))
    branch_id = Column(Integer, ForeignKey('branch.id'))
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch', back_populates='employees')
    time_logs = relationship('EmployeeTimeLog', back_populates='employee')
    
    def __repr__(self):
        return f'<Employee {self.name}>'

class EmployeeTimeLog(Base):
    __tablename__ = "employee_time_log"
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey('employee.id'))
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime)
    status = Column(String(20), default='active')  # active, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    employee = relationship('Employee', back_populates='time_logs')
    
    def __repr__(self):
        return f'<EmployeeTimeLog {self.id}>'

class Sale(Base):
    __tablename__ = "sale"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    branch_id = Column(Integer, ForeignKey('branch.id'))
    customer_id = Column(Integer, ForeignKey('customer.id'), nullable=True)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(20))
    status = Column(String(20), default='completed')
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    user = relationship('User', back_populates='sales')
    branch = relationship('Branch')
    customer = relationship('Customer', back_populates='sales')
    items = relationship('SaleItem', back_populates='sale')
    
    def __repr__(self):
        return f'<Sale {self.id}>'

class SaleItem(Base):
    __tablename__ = "sale_item"
    
    id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey('sale.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    # Relationships
    sale = relationship('Sale', back_populates='items')
    product = relationship('Product', back_populates='sale_items')
    
    def __repr__(self):
        return f'<SaleItem {self.id}>'

class InventoryTransaction(Base):
    __tablename__ = "inventory_transaction"
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    branch_id = Column(Integer, ForeignKey('branch.id'))
    quantity_change = Column(Integer, nullable=False)
    transaction_type = Column(String(20))  # 'in', 'out', 'adjustment'
    reference = Column(String(100))  # sale_id, purchase_id, etc.
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    product = relationship('Product')
    branch = relationship('Branch')
    
    def __repr__(self):
        return f'<InventoryTransaction {self.id}>'

class Barcode(Base):
    __tablename__ = "barcode"
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    barcode = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    product = relationship('Product', back_populates='barcodes')
    
    def __repr__(self):
        return f'<Barcode {self.barcode}>'

class Expense(Base):
    __tablename__ = "expense"
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch')
    
    def __repr__(self):
        return f'<Expense {self.id}>'

class Revenue(Base):
    __tablename__ = "revenue"
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch')
    
    def __repr__(self):
        return f'<Revenue {self.id}>'

class FinancialReport(Base):
    __tablename__ = "financial_report"
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_revenue = Column(Float, nullable=False)
    total_expenses = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    report_type = Column(String(20), nullable=False)  # daily, weekly, monthly, yearly
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch')
    
    def __repr__(self):
        return f'<FinancialReport {self.id}>'

class SalesForecast(Base):
    __tablename__ = "sales_forecast"
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    forecast_date = Column(Date, nullable=False)
    predicted_quantity = Column(Integer, nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch')
    product = relationship('Product')
    
    def __repr__(self):
        return f'<SalesForecast {self.id}>'

class RevenueForecast(Base):
    __tablename__ = "revenue_forecast"
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    forecast_date = Column(Date, nullable=False)
    predicted_revenue = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch')
    
    def __repr__(self):
        return f'<RevenueForecast {self.id}>'

class InventoryForecast(Base):
    __tablename__ = "inventory_forecast"
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branch.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    forecast_date = Column(Date, nullable=False)
    predicted_quantity = Column(Integer, nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    branch = relationship('Branch')
    product = relationship('Product')
    
    def __repr__(self):
        return f'<InventoryForecast {self.id}>'

class Customer(Base):
    __tablename__ = "customer"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True)
    phone = Column(String(20))
    address = Column(Text)
    loyalty_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    sales = relationship('Sale', back_populates='customer')
    feedback = relationship('CustomerFeedback', back_populates='customer')
    
    def __repr__(self):
        return f'<Customer {self.name}>'

class CustomerFeedback(Base):
    __tablename__ = "customer_feedback"
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customer.id'))
    product_id = Column(Integer, ForeignKey('product.id'))
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    customer = relationship('Customer', back_populates='feedback')
    product = relationship('Product')
    
    def __repr__(self):
        return f'<CustomerFeedback {self.id}>'

class ProductAvailability(Base):
    __tablename__ = "product_availability"
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('product.id'))
    branch_id = Column(Integer, ForeignKey('branch.id'))
    is_available = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    
    # Relationships
    product = relationship('Product')
    branch = relationship('Branch')
    
    def __repr__(self):
        return f'<ProductAvailability {self.id}>' 