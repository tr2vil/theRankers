"""Sprint 6: 실제 데이터 수집 스크립트.

1. 20개 종목 GICS 매핑 + 한경 크롤러 리포트 수집
2. 주가 수집 (최근 N일)
3. 추적 가격 업데이트
4. 스코어링 재계산
5. 게시판 재생성
"""

import asyncio
import sys
import logging
from datetime import date, timedelta

# 프로젝트 루트를 path에 추가
sys.path.insert(0, "/app")

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.stock import Stock
from app.models.board import Board
from app.services.collector.hankyung import fetch_stock_reports
from app.services.collector.storage import save_reports, get_or_create_stock
from app.services.market.price import save_prices, update_report_tracked_prices, calculate_excess_returns
from app.services.analysis.scorer import calculate_and_save_rankings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# 20개 종목 + GICS 매핑
STOCK_GICS = {
    "005930": ("삼성전자", "IT", "45"),
    "000660": ("SK하이닉스", "IT", "45"),
    "035420": ("네이버", "커뮤니케이션", "50"),
    "035720": ("카카오", "커뮤니케이션", "50"),
    "005380": ("현대자동차", "경기소비재", "25"),
    "068270": ("셀트리온", "헬스케어", "35"),
    "373220": ("LG에너지솔루션", "IT", "45"),
    "051910": ("LG화학", "소재", "15"),
    "006400": ("삼성SDI", "IT", "45"),
    "003670": ("포스코퓨처엠", "소재", "15"),
    "055550": ("신한지주", "금융", "40"),
    "105560": ("KB금융", "금융", "40"),
    "000270": ("기아", "경기소비재", "25"),
    "207940": ("삼성바이오로직스", "헬스케어", "35"),
    "012330": ("현대모비스", "경기소비재", "25"),
    "066570": ("LG전자", "경기소비재", "25"),
    "003550": ("LG", "산업재", "20"),
    "034730": ("SK", "산업재", "20"),
    "032830": ("삼성생명", "금융", "40"),
    "096770": ("SK이노베이션", "에너지", "10"),
}


async def step1_collect_reports():
    """한경 크롤러로 20개 종목 리포트 수집 + GICS 매핑."""
    logger.info("=== Step 1: 리포트 수집 시작 ===")
    total_saved = 0

    async with AsyncSessionLocal() as db:
        for code, (name, sector, sector_code) in STOCK_GICS.items():
            # 종목 생성 + GICS 매핑
            stock = await get_or_create_stock(db, code, name)
            if not stock.gics_sector:
                stock.gics_sector = sector
                stock.gics_sector_code = sector_code
                await db.commit()

            # 리포트 수집
            raw_reports = await fetch_stock_reports(code)
            if raw_reports:
                saved = await save_reports(db, raw_reports)
                total_saved += saved
                logger.info(f"[{code}] {name}: {saved}건 저장 (수집 {len(raw_reports)}건)")
            else:
                logger.warning(f"[{code}] {name}: 수집 0건")

    logger.info(f"=== Step 1 완료: 총 {total_saved}건 리포트 저장 ===")
    return total_saved


async def step2_collect_prices(days_back: int = 30):
    """pykrx로 주가 수집."""
    logger.info(f"=== Step 2: 주가 수집 시작 (최근 {days_back}일) ===")
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
                logger.info(f"[{stock.code}] {stock.name}: {saved}건 주가 저장")

    logger.info(f"=== Step 2 완료: 총 {total}건 주가 저장 ===")
    return total


async def step3_update_tracked_prices():
    """리포트 추적 가격 업데이트."""
    logger.info("=== Step 3: 추적 가격 업데이트 ===")
    async with AsyncSessionLocal() as db:
        updated = await update_report_tracked_prices(db)
    logger.info(f"=== Step 3 완료: {updated}건 업데이트 ===")
    return updated


async def step3b_calculate_excess_returns():
    """초과수익률 계산 (섹터 대비)."""
    logger.info("=== Step 3b: 초과수익률 계산 ===")
    async with AsyncSessionLocal() as db:
        updated = await calculate_excess_returns(db)
    logger.info(f"=== Step 3b 완료: {updated}건 초과수익률 업데이트 ===")
    return updated


async def step4_calculate_rankings():
    """스코어링 재계산."""
    logger.info("=== Step 4: 랭킹 재계산 ===")
    results = {}
    async with AsyncSessionLocal() as db:
        for period in ("1m", "3m", "6m", "12m"):
            count = await calculate_and_save_rankings(db, period)
            results[period] = count
    logger.info(f"=== Step 4 완료: {results} ===")
    return results


async def step5_create_boards():
    """게시판 재생성."""
    logger.info("=== Step 5: 게시판 생성 ===")
    async with AsyncSessionLocal() as db:
        boards_data = [
            ("general", "자유게시판", "general", None),
            ("analyst-review", "애널리스트 평가", "analyst", None),
            ("firm-review", "증권사 리뷰", "firm", None),
        ]
        # 주요 종목 토론 게시판
        for code in ["005930", "000660", "035420"]:
            result = await db.execute(select(Stock).where(Stock.code == code))
            stock = result.scalar_one_or_none()
            if stock:
                boards_data.append((f"stock-{code}", f"{stock.name} 토론방", "stock", stock.id))

        for slug, name, board_type, ref_id in boards_data:
            exists = await db.execute(select(Board).where(Board.slug == slug))
            if not exists.scalar_one_or_none():
                board = Board(slug=slug, name=name, board_type=board_type, reference_id=ref_id)
                db.add(board)

        await db.commit()
    logger.info("=== Step 5 완료: 게시판 생성 ===")


async def main():
    days_back = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    logger.info(f"Sprint 6 데이터 수집 시작 (주가: 최근 {days_back}일)")

    await step1_collect_reports()
    await step2_collect_prices(days_back)
    await step3_update_tracked_prices()
    await step3b_calculate_excess_returns()
    await step4_calculate_rankings()
    await step5_create_boards()

    logger.info("Sprint 6 데이터 수집 완료!")


if __name__ == "__main__":
    asyncio.run(main())
