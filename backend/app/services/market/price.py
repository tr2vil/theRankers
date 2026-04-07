"""주가 데이터 수집 서비스.

pykrx를 사용하여 국내 주가 데이터를 수집하고,
리포트의 추적 가격(1m/3m/6m/12m)을 업데이트한다.
"""

import logging
from datetime import date, timedelta

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.price import Price
from app.models.stock import Stock
from app.models.report import Report
from app.models.analyst import Analyst

logger = logging.getLogger(__name__)


def fetch_stock_prices(stock_code: str, start: date, end: date) -> list[dict]:
    """pykrx로 주가 데이터를 가져온다 (동기 함수)."""
    try:
        from pykrx import stock as pykrx_stock
        df = pykrx_stock.get_market_ohlcv_by_date(
            start.strftime("%Y%m%d"),
            end.strftime("%Y%m%d"),
            stock_code,
        )
        if df.empty:
            return []

        # 수정주가
        adj_df = pykrx_stock.get_market_ohlcv_by_date(
            start.strftime("%Y%m%d"),
            end.strftime("%Y%m%d"),
            stock_code,
            adjusted=True,
        )

        prices = []
        for dt, row in df.iterrows():
            price_date = dt.date() if hasattr(dt, "date") else dt
            adj_close = adj_df.loc[dt, "종가"] if dt in adj_df.index else row["종가"]
            prices.append({
                "date": price_date,
                "open_price": int(row["시가"]),
                "high_price": int(row["고가"]),
                "low_price": int(row["저가"]),
                "close_price": int(row["종가"]),
                "volume": int(row["거래량"]),
                "adjusted_close": float(adj_close),
            })

        return prices

    except Exception as e:
        logger.error(f"[{stock_code}] 주가 수집 실패: {e}")
        return []


async def save_prices(db: AsyncSession, stock_id: int, stock_code: str, start: date, end: date) -> int:
    """주가 데이터를 수집하여 DB에 저장한다."""
    prices_data = fetch_stock_prices(stock_code, start, end)
    saved = 0

    for p in prices_data:
        exists = await db.execute(
            select(Price.id).where(
                Price.stock_id == stock_id,
                Price.date == p["date"],
            )
        )
        if exists.scalar_one_or_none():
            continue

        price = Price(stock_id=stock_id, **p)
        db.add(price)
        saved += 1

    if saved:
        await db.commit()

    return saved


async def get_price_on_date(db: AsyncSession, stock_id: int, target_date: date) -> int | None:
    """특정 날짜의 종가를 조회한다. 해당일 데이터가 없으면 가장 가까운 이전 영업일."""
    result = await db.execute(
        select(Price.close_price)
        .where(Price.stock_id == stock_id, Price.date <= target_date)
        .order_by(Price.date.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def update_report_tracked_prices(db: AsyncSession) -> int:
    """리포트의 추적 가격(1m/3m/6m/12m)을 업데이트한다."""
    today = date.today()
    updated = 0

    # price_at_report가 아직 없는 리포트 처리
    result = await db.execute(
        select(Report).where(Report.price_at_report.is_(None))
    )
    for report in result.scalars().all():
        price = await get_price_on_date(db, report.stock_id, report.report_date)
        if price:
            report.price_at_report = price
            updated += 1

    # 기간별 추적 가격 업데이트
    periods = [
        ("price_1m", 30),
        ("price_3m", 91),
        ("price_6m", 182),
        ("price_12m", 365),
    ]

    result = await db.execute(select(Report))
    for report in result.scalars().all():
        for field, days in periods:
            target_date = report.report_date + timedelta(days=days)
            if target_date > today:
                continue
            if getattr(report, field) is not None:
                continue

            price = await get_price_on_date(db, report.stock_id, target_date)
            if price:
                setattr(report, field, price)
                updated += 1

        # 목표가 달성 여부 체크
        if report.target_achieved is None and report.price_at_report:
            achieved = await _check_target_achieved(
                db, report.stock_id, report.report_date, report.target_price, report.opinion
            )
            if achieved:
                report.target_achieved = True
                report.achieved_date = achieved
            elif report.report_date + timedelta(days=365) <= today:
                report.target_achieved = False

    if updated:
        await db.commit()
        logger.info(f"{updated}건 추적 가격 업데이트")

    return updated


async def _check_target_achieved(
    db: AsyncSession,
    stock_id: int,
    report_date: date,
    target_price: int,
    opinion: str,
) -> date | None:
    """리포트 발행일로부터 12개월 내 목표가 도달 여부를 확인한다."""
    end_date = report_date + timedelta(days=365)
    today = date.today()
    check_end = min(end_date, today)

    if opinion == "매수":
        # 매수 의견: 고가가 목표가 이상
        result = await db.execute(
            select(Price.date)
            .where(
                Price.stock_id == stock_id,
                Price.date > report_date,
                Price.date <= check_end,
                Price.high_price >= target_price,
            )
            .order_by(Price.date)
            .limit(1)
        )
    elif opinion == "매도":
        # 매도 의견: 저가가 목표가 이하
        result = await db.execute(
            select(Price.date)
            .where(
                Price.stock_id == stock_id,
                Price.date > report_date,
                Price.date <= check_end,
                Price.low_price <= target_price,
            )
            .order_by(Price.date)
            .limit(1)
        )
    else:
        return None

    return result.scalar_one_or_none()


async def calculate_excess_returns(db: AsyncSession) -> int:
    """리포트의 초과수익률(섹터 대비)을 계산한다.

    초과수익률 = 종목 수익률 - 같은 GICS 섹터 평균 수익률
    """
    updated = 0

    periods = [
        ("excess_return_1m", "price_1m"),
        ("excess_return_3m", "price_3m"),
        ("excess_return_6m", "price_6m"),
        ("excess_return_12m", "price_12m"),
    ]

    # 모든 리포트 + 종목 정보 로드
    result = await db.execute(
        select(Report, Stock)
        .join(Stock, Report.stock_id == Stock.id)
    )
    rows = result.all()

    for excess_field, price_field in periods:
        # 섹터별 수익률 수집
        sector_returns: dict[str, list[float]] = {}
        report_data: list[tuple[Report, str, float]] = []  # (report, sector_code, stock_return)

        for report, stock in rows:
            future_price = getattr(report, price_field)
            if future_price is None or not report.price_at_report:
                continue
            stock_return = (future_price - report.price_at_report) / report.price_at_report
            sector = stock.gics_sector_code or "99"
            sector_returns.setdefault(sector, []).append(stock_return)
            report_data.append((report, sector, stock_return))

        # 섹터별 평균
        sector_avg: dict[str, float] = {}
        for sector, returns in sector_returns.items():
            sector_avg[sector] = sum(returns) / len(returns)

        # 초과수익률 = 종목 수익률 - 섹터 평균 수익률
        for report, sector, stock_return in report_data:
            if getattr(report, excess_field) is not None:
                continue
            excess = stock_return - sector_avg.get(sector, 0)
            setattr(report, excess_field, round(excess, 6))
            updated += 1

    if updated:
        await db.commit()
        logger.info(f"{updated}건 초과수익률 업데이트")

    return updated
