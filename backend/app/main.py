from fastapi import FastAPI
from app.routes import metrics, calculator, costs

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SaaS Cloud Economics Dashboard",
    description="A dashboard to monitor cloud economics and AWS metrics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
app.include_router(costs.router, prefix="/costs", tags=["Cost Calculator"])
# app.include_router(calculator.router, prefix="/costs", tags=["Cost Calculator"])

@app.get("/")
async def root():
    return {"message": "Welcome to the SaaS Cloud Economics Dashboard"}

