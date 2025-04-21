# Import all models here
from .user import User, user_role, user_permission
from .role import Role
from .permission import Permission
from .branch import Branch
from .product import Product, Category, ProductImage, ProductVariant
from .order import Order, OrderItem, Payment
from .sale import Sale, SaleItem
from .supplier import Supplier
from .address import Address
from .employee import Employee, Attendance, PerformanceReview, EmployeeTimeLog
from .integration import IntegrationProvider, IntegrationInstance, IntegrationLog
from .transaction import Transaction, TransactionCategory
from .settings import Business, SystemSetting
from .notification import Notification, NotificationSetting
from .customer import Customer

# We now use SQLAlchemy directly instead of db.Model

__all__ = [
    'User',
    'user_role',
    'user_permission',
    'Role',
    'Permission',
    'Branch',
    'Product',
    'Category',
    'ProductImage',
    'ProductVariant',
    'Order',
    'OrderItem',
    'Payment',
    'Sale',
    'SaleItem',
    'Supplier',
    'Address',
    'Employee',
    'Attendance',
    'PerformanceReview',
    'EmployeeTimeLog',
    'IntegrationProvider',
    'IntegrationInstance',
    'IntegrationLog',
    'Transaction',
    'TransactionCategory',
    'Business',
    'SystemSetting',
    'Notification',
    'NotificationSetting',
    'Customer'
] 