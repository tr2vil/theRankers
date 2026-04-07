from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.stock import Stock
from app.models.report import Report
from app.models.price import Price
from app.schemas.stock import StockResponse, StockListResponse, StockConsensus, PricePoint

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


@router.get("/{stock_id}/prices", response_model=list[PricePoint])
async def get_stock_prices(
    stock_id: int,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    stock_exists = await db.execute(select(Stock.id).where(Stock.id == stock_id))
    if not stock_exists.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Stock not found")

    result = await db.execute(
        select(Price)
        .where(Price.stock_id == stock_id)
        .order_by(Price.date.desc())
        .limit(days)
    )
    prices = list(reversed(result.scalars().all()))
    return [PricePoint.model_validate(p) for p in prices]


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
            func.sum(case((Report.opinion == "매수", 1), else_=0)),
            func.sum(case((Report.opinion == "중립", 1), else_=0)),
            func.sum(case((Report.opinion == "매도", 1), else_=0)),
            func.avg(Report.target_price),
            func.max(Report.target_price),
            func.min(Report.target_price),
        ).where(Report.stock_id == stock_id)
    )
    row = stats.one()
    total, buy, hold, sell, avg_tp, high_tp, low_tp = row

    return StockConsensus(
        stock=StockResponse.model_validate(stock),
        buy_count=buy or 0,
        hold_count=hold or 0,
        sell_count=sell or 0,
        avg_target_price=avg_tp or 0,
        high_target_price=high_tp,
        low_target_price=low_tp,
        current_price=None,
        report_count=total or 0,
    )
