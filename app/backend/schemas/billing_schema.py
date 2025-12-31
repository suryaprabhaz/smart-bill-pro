from pydantic import BaseModel
from typing import List, Optional

class ItemBase(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

class InvoiceCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    items: List[ItemBase]
    discount_amount: float = 0.0
    payment_mode: str = "Cash"

class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    purchase_price: float
    selling_price: float
    stock_quantity: int
    min_stock_level: int = 5