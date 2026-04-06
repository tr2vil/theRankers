"""데이터 수집 Celery 태스크."""

import asyncio
import logging

from app.tasks import celery_app
from app.database import AsyncSessionLocal
from app.services.collector.hankyung import fetch_stock_reports
from app.services.collector.storage import save_reports

logger = logging.getLogger(__name__)

# 주요 종목 코드 (KOSPI 대형주)
MAJOR_STOCKS = [
    "005930",  # 삼성전자
    "000660",  # SK하이닉스
    "035420",  # 네이버
    "035720",  # 카카오
    "005380",  # 현대자동차
    "068270",  # 셀트리온
    "373220",  # LG에너지솔루션
    "051910",  # LG화학
    "006400",  # 삼성SDI
    "003670",  # 포스코퓨처엠
    "055550",  # 신한지주
    "105560",  # KB금융
    "000270",  # 기아
    "207940",  # 삼성바이오로직스
    "012330",  # 현대모비스
    "066570",  # LG전자
    "003550",  # LG
    "034730",  # SK
    "032830",  # 삼성생명
    "096770",  # SK이노베이션
]


@celery_app.task(name="collect_reports_for_stock", bind=True, max_retries=3)
def collect_reports_for_stock(self, stock_code: str):
    """단일 종목의 리포트를 수집한다."""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_collect_stock(stock_code))
        return result
    except Exception as exc:
        logger.error(f"[{stock_code}] 수집 실패: {exc}")
        self.retry(exc=exc, countdown=60)


async def _collect_stock(stock_code: str) -> int:
    raw_reports = await fetch_stock_reports(stock_code)
    if not raw_reports:
        return 0

    async with AsyncSessionLocal() as db:
        saved = await save_reports(db, raw_reports)
    return saved


@celery_app.task(name="collect_all_major_stocks")
def collect_all_major_stocks():
    """주요 종목들의 리포트를 일괄 수집한다."""
    total = 0
    for code in MAJOR_STOCKS:
        result = collect_reports_for_stock.delay(code)
        total += 1
    logger.info(f"{total}개 종목 수집 태스크 발행")
    return total


@celery_app.task(name="collect_latest_reports")
def collect_latest_reports():
    """주요 종목들의 최신 리포트를 수집한다."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(_collect_latest())
    return result


async def _collect_latest() -> int:
    total_saved = 0
    for code in MAJOR_STOCKS:
        raw_reports = await fetch_stock_reports(code)
        if raw_reports:
            async with AsyncSessionLocal() as db:
                saved = await save_reports(db, raw_reports)
                total_saved += saved
    logger.info(f"최신 리포트 수집 완료: {total_saved}건 저장")
    return total_saved
