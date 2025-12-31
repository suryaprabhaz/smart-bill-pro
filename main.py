import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.backend.database import engine, Base
from config import settings
from app.backend.api import billing_routes, inventory_routes

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes - Synchronization is key here
app.include_router(billing_routes.router, prefix="/api/v1")
app.include_router(inventory_routes.router, prefix="/api/v1/inventory")

# Static Files
app.mount("/", StaticFiles(directory="app/frontend", html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)