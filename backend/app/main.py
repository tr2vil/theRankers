from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import auth, analysts, reports, stocks, rankings, boards

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title=settings.app_name,
    description="한국 증권 애널리스트 랭킹 서비스",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(analysts.router, prefix="/api/v1/analysts", tags=["analysts"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(stocks.router, prefix="/api/v1/stocks", tags=["stocks"])
app.include_router(rankings.router, prefix="/api/v1/rankings", tags=["rankings"])
app.include_router(boards.router, prefix="/api/v1/boards", tags=["boards"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.app_name}
