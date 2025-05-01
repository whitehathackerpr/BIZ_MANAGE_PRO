from typing import Optional, List
from pydantic import BaseModel, confloat, conint
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    MOBILE_PAYMENT = "mobile_payment"
    CHEQUE = "cheque"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    FAILED = "failed"

# Transaction item schemas
class TransactionItemBase(BaseModel):
    product_id: int
    quantity: conint(gt=0)
    unit_price: confloat(gt=0)
    discount: confloat(ge=0) = 0
    notes: Optional[str] = None

class TransactionItemCreate(TransactionItemBase):
    pass

class TransactionItem(TransactionItemBase):
    id: int
    transaction_id: int
    total: float
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction schemas
class TransactionBase(BaseModel):
    branch_id: int
    customer_id: Optional[int] = None
    transaction_type: TransactionType
    payment_method: PaymentMethod
    subtotal: confloat(gt=0)
    tax: confloat(ge=0) = 0
    discount: confloat(ge=0) = 0
    total: confloat(gt=0)
    notes: Optional[str] = None
    reference: Optional[str] = None
    payment_details: Optional[dict] = None

class TransactionCreate(TransactionBase):
    items: List[TransactionItemCreate]

class TransactionUpdate(BaseModel):
    customer_id: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None
    notes: Optional[str] = None
    payment_details: Optional[dict] = None

class Transaction(TransactionBase):
    id: int
    cashier_id: int
    status: TransactionStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[TransactionItem] = []

    class Config:
        from_attributes = True

# Order schemas
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class OrderItemBase(BaseModel):
    product_id: int
    quantity: conint(gt=0)
    unit_price: confloat(gt=0)
    discount: confloat(ge=0) = 0
    notes: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    total: float
    created_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    branch_id: int
    customer_id: int
    shipping_address: Optional[str] = None
    billing_address: Optional[str] = None
    subtotal: confloat(gt=0)
    tax: confloat(ge=0) = 0
    shipping_cost: confloat(ge=0) = 0
    discount: confloat(ge=0) = 0
    total: confloat(gt=0)
    notes: Optional[str] = None
    payment_method: PaymentMethod
    payment_details: Optional[dict] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    shipping_address: Optional[str] = None
    billing_address: Optional[str] = None
    notes: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    payment_details: Optional[dict] = None

class Order(OrderBase):
    id: int
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItem] = []

    class Config:
        from_attributes = True

# Sales summary schemas
class SalesSummary(BaseModel):
    total_sales: float
    total_transactions: int
    average_transaction_value: float
    total_refunds: float
    net_sales: float
    total_tax: float
    total_discounts: float
    sales_by_payment_method: dict
    sales_by_product_category: dict
    top_selling_products: List[dict]
    sales_by_hour: dict
    sales_by_day: dict

    class Config:
        from_attributes = True

# Sales trend schemas
class SalesTrend(BaseModel):
    date: datetime
    total_sales: float
    transaction_count: int
    average_sale: float
    refund_count: int
    refund_amount: float
    net_sales: float

    class Config:
        from_attributes = True 