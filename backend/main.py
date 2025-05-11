from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import engine, Base
from app.routers import transactions, categories, categorization, auth
from app.db_init import init_db

# Initialize database with tables and default data
init_db()

app = FastAPI(title="Bank Statement Classifier API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(categorization.router, prefix="/api/categorization", tags=["categorization"])
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])

@app.get("/")
async def root():
    return {"message": "Welcome to Bank Statement Classifier API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
