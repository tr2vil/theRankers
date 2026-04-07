from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.models.stock import Stock
from app.models.analyst import Analyst

router = APIRouter()


class SearchResult(BaseModel):
    type: str  # "stock" or "analyst"
    id: int
    name: str
    sub: str  # code for stock, firm for analyst


class SearchResponse(BaseModel):
    results: list[SearchResult]


@router.get("", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, max_length=100),
    db: AsyncSession = Depends(get_db),
):
    sanitized = q.replace("%", "\\%").replace("_", "\\_")
    pattern = f"%{sanitized}%"
    results: list[SearchResult] = []

    # Search stocks
    stock_result = await db.execute(
        select(Stock)
        .where(Stock.name.ilike(pattern) | Stock.code.ilike(pattern))
        .limit(5)
    )
    for s in stock_result.scalars().all():
        results.append(SearchResult(type="stock", id=s.id, name=s.name, sub=s.code))

    # Search analysts
    analyst_result = await db.execute(
        select(Analyst)
        .where(Analyst.name.ilike(pattern) | Analyst.firm.ilike(pattern))
        .limit(5)
    )
    for a in analyst_result.scalars().all():
        results.append(SearchResult(type="analyst", id=a.id, name=a.name, sub=a.firm))

    return SearchResponse(results=results)
