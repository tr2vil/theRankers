"""수집된 리포트를 DB에 저장하는 서비스.

중복 방지: (analyst_id, stock_id, report_date) 복합 유니크 제약조건 활용.
"""

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.models.analyst import Analyst
from app.models.stock import Stock
from app.models.report import Report
from app.services.collector.hankyung import RawReport

logger = logging.getLogger(__name__)


async def get_or_create_analyst(db: AsyncSession, name: str, firm: str) -> Analyst:
    """애널리스트를 조회하거나 새로 생성한다."""
    result = await db.execute(
        select(Analyst).where(Analyst.name == name, Analyst.firm == firm)
    )
    analyst = result.scalar_one_or_none()

    if not analyst:
        analyst = Analyst(name=name, firm=firm)
        db.add(analyst)
        await db.flush()
        logger.info(f"새 애널리스트 등록: {name} ({firm})")

    return analyst


async def get_or_create_stock(
    db: AsyncSession, code: str, name: str, market: str = "KOSPI"
) -> Stock:
    """종목을 조회하거나 새로 생성한다."""
    result = await db.execute(select(Stock).where(Stock.code == code))
    stock = result.scalar_one_or_none()

    if not stock:
        stock = Stock(code=code, name=name, market=market)
        db.add(stock)
        await db.flush()
        logger.info(f"새 종목 등록: {name} ({code})")

    return stock


async def save_reports(db: AsyncSession, raw_reports: list[RawReport]) -> int:
    """수집된 리포트들을 DB에 저장한다. 중복은 건너뛴다."""
    saved = 0

    for raw in raw_reports:
        try:
            analyst = await get_or_create_analyst(db, raw.analyst_name, raw.firm)
            stock = await get_or_create_stock(db, raw.stock_code, raw.stock_name)

            # 중복 체크
            exists = await db.execute(
                select(Report.id).where(
                    Report.analyst_id == analyst.id,
                    Report.stock_id == stock.id,
                    Report.report_date == raw.report_date,
                )
            )
            if exists.scalar_one_or_none():
                continue

            report = Report(
                analyst_id=analyst.id,
                stock_id=stock.id,
                title=raw.title,
                opinion=raw.opinion,
                target_price=raw.target_price,
                report_date=raw.report_date,
                source_url=raw.source_url,
            )
            db.add(report)
            saved += 1

        except Exception as e:
            logger.error(f"리포트 저장 실패: {raw.analyst_name}/{raw.stock_name} - {e}")
            continue

    if saved:
        await db.commit()
        logger.info(f"{saved}건 리포트 저장 완료 (총 {len(raw_reports)}건 중)")

    return saved
