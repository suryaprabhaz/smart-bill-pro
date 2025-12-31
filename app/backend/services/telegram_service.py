import httpx
from config import settings
from datetime import datetime

async def send_to_telegram(message: str):
    """
    Core Backup & Audit mechanism. 
    Sends critical business data to a private Telegram channel.
    """
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHANNEL_ID:
        print("Telegram Config missing. Skipping notification.")
        return False

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": settings.TELEGRAM_CHANNEL_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            print(f"Telegram Notification Failed: {e}")
            return False

def format_invoice_msg(invoice_data: dict):
    return (
        f"<b>🧾 INVOICE GENERATED</b>\n"
        f"<b>No:</b> {invoice_data['invoice_number']}\n"
        f"<b>Customer:</b> {invoice_data['customer_name']}\n"
        f"<b>Amount:</b> ₹{invoice_data['total_amount']}\n"
        f"<b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
        f"<i>Verified Secure Backup</i>"
    )