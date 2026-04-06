from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.stock import Stock
from app.models.report import Report
from app.schemas.stock import StockResponse, StockListResponse, StockConsensus

router = APIRouter()


@router.get("", response_model=StockListResponse)
async def list_stocks(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    market: str | None = None,
    sector: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Stock)
    count_query = select(func.count(Stock.id))

    if market:
        query = query.where(Stock.market == market)
        count_query = count_query.where(Stock.market == market)
    if sector:
        query = query.where(Stock.gics_sector == sector)
        count_query = count_query.where(Stock.gics_sector == sector)
    if search:
        pattern = f"%{search}%"
        query = query.where(Stock.name.ilike(pattern) | Stock.code.ilike(pattern))
        count_query = count_query.where(Stock.name.ilike(pattern) | Stock.code.ilike(pattern))

    query = query.order_by(Stock.name).offset((page - 1) * size).limit(size)

    result = await db.execute(query)
    total_result = await db.execute(count_query)

    return StockListResponse(
        items=[StockResponse.model_validate(s) for s in result.scalars().all()],
        total=total_result.scalar_one(),
        page=page,
        size=size,
    )


@router.get("/{stock_id}", response_model=StockResponse)
async def get_stock(stock_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stock).where(Stock.id == stock_id))
    stock = result.scalar_one_or_none()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return StockResponse.model_validate(stock)


@router.get("/{stock_id}/consensus", response_model=StockConsensus)
async def get_stock_consensus(stock_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stock).where(Stock.id == stock_id))
    stock = result.scalar_one_or_none()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # Aggregate latest reports
    stats = await db.execute(
        select(
            func.count(Report.id),
            func.sum(func.cast(Report.opinion == "매수", int)),
            func.sum(func.cast(Report.opinion == "중립", int)),
            func.sum(func.cast(Report.opinion == "매도", int)),
            func.avg(Report.target_price),
        ).where(Report.stock_id == stock_id)
    )
    row = stats.one()
    total, buy, hold, sell, avg_tp = row

    return StockConsensus(
        stock=StockResponse.model_validate(stock),
        buy_count=buy or 0,
        hold_count=hold or 0,
        sell_count=sell or 0,
        avg_target_price=avg_tp or 0,
        current_price=None,
        report_count=total or 0,
    )
