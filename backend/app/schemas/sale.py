from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum

class PaymentMethod(str, Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    MOBILE_PAYMENT = "mobile_payment"
    BANK_TRANSFER = "bank_transfer"
    CHECK = "check"
    OTHER = "other"

class SaleStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class SaleItemBase(BaseModel):
    """Base schema for sale item"""
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    discount: float = Field(0, ge=0)
    tax_rate: Optional[float] = Field(0, ge=0)
    
    @property
    def total_price(self) -> float:
        return (self.unit_price * self.quantity) * (1 - self.discount / 100) * (1 + self.tax_rate / 100)

class SaleItemCreate(SaleItemBase):
    """Schema for creating a sale item"""
    pass

class SaleItemUpdate(BaseModel):
    """Schema for updating a sale item"""
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, gt=0)
    discount: Optional[float] = Field(None, ge=0)
    tax_rate: Optional[float] = Field(None, ge=0)

class SaleItemResponse(SaleItemBase):
    """Schema for sale item response"""
    id: int
    sale_id: int
    product_name: str
    total_price: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    """Base schema for sale"""
    customer_id: Optional[int] = None
    cashier_id: int
    branch_id: int
    payment_method: PaymentMethod = PaymentMethod.CASH
    status: SaleStatus = SaleStatus.COMPLETED
    discount: float = Field(0, ge=0)
    tax: float = Field(0, ge=0)
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    """Schema for creating a sale"""
    items: List[SaleItemCreate]

class SaleUpdate(BaseModel):
    """Schema for updating a sale"""
    customer_id: Optional[int] = None
    cashier_id: Optional[int] = None
    branch_id: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[SaleStatus] = None
    discount: Optional[float] = Field(None, ge=0)
    tax: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None

class SaleResponse(SaleBase):
    """Schema for sale response"""
    id: int
    total_amount: float
    items: List[SaleItemResponse]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SaleFilter(BaseModel):
    """Schema for filtering sales"""
    branch_id: Optional[int] = None
    cashier_id: Optional[int] = None
    customer_id: Optional[int] = None
    status: Optional[SaleStatus] = None
    payment_method: Optional[PaymentMethod] = None
    min_amount: Optional[float] = Field(None, ge=0)
    max_amount: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if v and 'start_date' in values and values['start_date'] and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v 