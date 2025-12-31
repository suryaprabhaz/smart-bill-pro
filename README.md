# SmartBill Pro 🧾

![SmartBill Pro Dashboard](https://via.placeholder.com/800x400?text=SmartBill+Pro+Dashboard+Preview)

> A professional, modern Billing and Inventory Management System built with **FastAPI** and **Vanilla JS**.

## 🚀 Features

- **Billing/Invoicing**: Create professional invoices with automatic tax and total calculations.
- **Inventory Management**: Real-time stock tracking with low-stock alerts.
- **Dashboard Analytics**: Visual sales reports and daily summaries using Chart.js.
- **Modern UI**: Fully responsive, glassmorphism-inspired design.
- **Telegram Integration**: (Optional) Get real-time sales alerts on Telegram.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy
- **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), JavaScript (ES6+)
- **Database**: SQLite (Default) / PostgreSQL (Compatible)
- **Tools**: Chart.js, RemixIcon

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/smart-bill-pro.git
    cd smart-bill-pro
    ```

2.  **Create Custom Environment** (Recommended)
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=sqlite:///./data/smartbill.db
    SECRET_KEY=your_secret_key_here
    # Optional
    TELEGRAM_BOT_TOKEN=...
    TELEGRAM_CHAT_ID=...
    ```

## ▶️ Usage

Run the server:
```bash
python main.py
```
Open your browser and navigate to `http://localhost:8000`.

## 👤 Author

Developed by **@SuryaPrabhas**.

## 📄 License

This project is licensed under the MIT License.
