from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="staff") # admin, staff, viewer
    is_active = Column(Boolean, default=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    purchase_price = Column(Float)
    selling_price = Column(Float)
    stock_quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=5)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    customer_name = Column(String)
    customer_phone = Column(String, nullable=True)
    total_amount = Column(Float)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    payment_mode = Column(String) # Cash, UPI, Card
    # Storing items as JSON for a permanent snapshot of the sale
    items_json = Column(JSON) 
    created_at = Column(DateTime, default=datetime.utcnow)