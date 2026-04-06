"""분석 및 랭킹 Celery 태스크."""

import asyncio
import logging
from datetime import date, timedelta

from app.tasks import celery_app
from app.database import AsyncSessionLocal
from app.services.market.price import save_prices, update_report_tracked_prices
from app.services.analysis.scorer import calculate_and_save_rankings
from app.models.stock import Stock
from sqlalchemy import select

logger = logging.getLogger(__name__)


@celery_app.task(name="update_stock_prices")
def update_stock_prices(days_back: int = 30):
    """모든 종목의 최근 주가를 업데이트한다."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(_update_all_prices(days_back))
    return result


async def _update_all_prices(days_back: int) -> int:
    end = date.today()
    start = end - timedelta(days=days_back)
    total = 0

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Stock))
        stocks = result.scalars().all()

        for stock in stocks:
            saved = await save_prices(db, stock.id, stock.code, start, end)
            total += saved
            if saved:
                logger.info(f"[{stock.code}] {saved}건 주가 저장")

    return total


@celery_app.task(name="update_tracked_prices")
def update_tracked_prices():
    """리포트의 추적 가격을 업데이트한다."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(_update_tracked())
    return result


async def _update_tracked() -> int:
    async with AsyncSessionLocal() as db:
        return await update_report_tracked_prices(db)


@celery_app.task(name="calculate_rankings")
def calculate_rankings():
    """모든 기간의 랭킹을 계산한다."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(_calc_all_rankings())
    return result


async def _calc_all_rankings() -> dict:
    results = {}
    async with AsyncSessionLocal() as db:
        for period in ("1m", "3m", "6m", "12m"):
            count = await calculate_and_save_rankings(db, period)
            results[period] = count
    logger.info(f"랭킹 계산 완료: {results}")
    return results
