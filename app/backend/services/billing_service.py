from sqlalchemy.orm import Session
from ..models.models import Invoice, Product
from ..schemas.billing_schema import InvoiceCreate
from .telegram_service import send_to_telegram, format_invoice_msg
import uuid

async def process_invoice(db: Session, data: InvoiceCreate):
    # 1. Calculate totals and check stock
    grand_total = 0.0
    items_list = []
    
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise Exception(f"Product ID {item.product_id} not found")
        
        if product.stock_quantity < item.quantity:
            raise Exception(f"Insufficient stock for {product.name}")

        # Reduce stock
        product.stock_quantity -= item.quantity
        
        item_total = item.price * item.quantity
        grand_total += item_total
        items_list.append({
            "product_id": item.product_id,
            "name": item.name,
            "qty": item.quantity,
            "price": item.price,
            "subtotal": item_total
        })

    final_amount = grand_total - data.discount_amount
    inv_no = f"INV-{uuid.uuid4().hex[:6].upper()}"

    # 2. Save to DB
    new_invoice = Invoice(
        invoice_number=inv_no,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        total_amount=final_amount,
        discount_amount=data.discount_amount,
        payment_mode=data.payment_mode,
        items_json=items_list
    )
    
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    # 3. Telegram Backup Audit
    msg = format_invoice_msg({
        "invoice_number": inv_no,
        "customer_name": data.customer_name,
        "total_amount": final_amount
    })
    await send_to_telegram(msg)

    return new_invoice