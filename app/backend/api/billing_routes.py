from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Invoice
from ..schemas.billing_schema import InvoiceCreate
from ..services.billing_service import process_invoice

router = APIRouter(tags=["Billing"])

@router.post("/create")
async def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    try:
        result = await process_invoice(db, invoice)
        return {"status": "success", "invoice_number": result.invoice_number}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history")
def get_invoice_history(db: Session = Depends(get_db)):
    return db.query(Invoice).order_by(Invoice.created_at.desc()).all()