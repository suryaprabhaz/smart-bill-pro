from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Product
from ..schemas.billing_schema import ProductCreate

router = APIRouter(tags=["Inventory"])

@router.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.post("/add")
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product