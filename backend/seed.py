"""시드 데이터 생성 스크립트.

실제와 유사한 구조의 샘플 데이터를 DB에 넣어 서비스를 테스트한다.
사용법: docker compose exec backend python seed.py
"""

import asyncio
import random
from datetime import date, timedelta

from app.database import AsyncSessionLocal, engine, Base
from app.models.analyst import Analyst
from app.models.stock import Stock
from app.models.report import Report
from app.models.price import Price
from app.models.ranking import Ranking
from app.models.board import Board

# 실제 증권사 및 애널리스트 (가상 이름)
ANALYSTS = [
    ("김민수", "미래에셋증권", "IT"),
    ("이서연", "삼성증권", "헬스케어"),
    ("박준혁", "KB증권", "금융"),
    ("정하윤", "한국투자증권", "IT"),
    ("최동현", "NH투자증권", "경기소비재"),
    ("한지민", "대신증권", "소재"),
    ("오승우", "메리츠증권", "산업재"),
    ("윤서아", "키움증권", "커뮤니케이션"),
    ("송태준", "신한투자증권", "IT"),
    ("강예진", "하나증권", "헬스케어"),
    ("임재혁", "유안타증권", "금융"),
    ("조수빈", "교보증권", "에너지"),
    ("황도윤", "IBK투자증권", "IT"),
    ("배서현", "DB금융투자", "경기소비재"),
    ("신우진", "한화투자증권", "소재"),
    ("문채원", "iM증권", "IT"),
    ("류건우", "BNK투자증권", "산업재"),
    ("노지현", "SK증권", "헬스케어"),
    ("권민재", "LS증권", "유틸리티"),
    ("장서윤", "다올투자증권", "부동산"),
]

STOCKS = [
    ("005930", "삼성전자", "KOSPI", "IT", "45"),
    ("000660", "SK하이닉스", "KOSPI", "IT", "45"),
    ("035420", "네이버", "KOSPI", "커뮤니케이션", "50"),
    ("035720", "카카오", "KOSPI", "커뮤니케이션", "50"),
    ("005380", "현대자동차", "KOSPI", "경기소비재", "25"),
    ("068270", "셀트리온", "KOSPI", "헬스케어", "35"),
    ("373220", "LG에너지솔루션", "KOSPI", "IT", "45"),
    ("051910", "LG화학", "KOSPI", "소재", "15"),
    ("006400", "삼성SDI", "KOSPI", "IT", "45"),
    ("055550", "신한지주", "KOSPI", "금융", "40"),
    ("105560", "KB금융", "KOSPI", "금융", "40"),
    ("000270", "기아", "KOSPI", "경기소비재", "25"),
    ("207940", "삼성바이오로직스", "KOSPI", "헬스케어", "35"),
    ("066570", "LG전자", "KOSPI", "경기소비재", "25"),
    ("003490", "대한항공", "KOSPI", "산업재", "20"),
]

BOARDS = [
    ("general", "자유게시판", "general"),
    ("stock-005930", "삼성전자 토론방", "stock"),
    ("stock-000660", "SK하이닉스 토론방", "stock"),
    ("stock-035420", "네이버 토론방", "stock"),
    ("analyst-review", "애널리스트 평가", "analyst"),
    ("firm-review", "증권사 리뷰", "firm"),
]


def _random_price(base: int) -> int:
    return int(base * random.uniform(0.85, 1.15))


def _random_target(current: int, opinion: str) -> int:
    if opinion == "매수":
        return int(current * random.uniform(1.1, 1.4))
    elif opinion == "매도":
        return int(current * random.uniform(0.7, 0.95))
    else:
        return int(current * random.uniform(0.95, 1.05))


async def seed():
    async with AsyncSessionLocal() as db:
        # 1. 종목 생성
        stocks = []
        for code, name, market, sector, sector_code in STOCKS:
            stock = Stock(
                code=code, name=name, market=market,
                gics_sector=sector, gics_sector_code=sector_code,
            )
            db.add(stock)
            stocks.append(stock)
        await db.flush()
        print(f"종목 {len(stocks)}개 생성")

        # 2. 애널리스트 생성
        analysts = []
        for name, firm, sector in ANALYSTS:
            analyst = Analyst(name=name, firm=firm, sector=sector)
            db.add(analyst)
            analysts.append(analyst)
        await db.flush()
        print(f"애널리스트 {len(analysts)}명 생성")

        # 3. 주가 데이터 생성 (최근 15개월)
        base_prices = {
            "005930": 78000, "000660": 195000, "035420": 310000,
            "035720": 62000, "005380": 260000, "068270": 180000,
            "373220": 410000, "051910": 380000, "006400": 350000,
            "055550": 52000, "105560": 78000, "000270": 120000,
            "207940": 800000, "066570": 95000, "003490": 28000,
        }

        today = date.today()
        for stock in stocks:
            base = base_prices.get(stock.code, 100000)
            price = base
            d = today - timedelta(days=450)
            while d <= today:
                if d.weekday() < 5:  # 평일만
                    change = random.uniform(-0.03, 0.03)
                    price = max(1000, int(price * (1 + change)))
                    open_p = _random_price(price)
                    high_p = max(price, open_p) + random.randint(0, int(price * 0.02))
                    low_p = min(price, open_p) - random.randint(0, int(price * 0.02))

                    p = Price(
                        stock_id=stock.id, date=d,
                        open_price=open_p, high_price=high_p,
                        low_price=low_p, close_price=price,
                        volume=random.randint(100000, 5000000),
                        adjusted_close=float(price),
                    )
                    db.add(p)
                d += timedelta(days=1)

        await db.flush()
        print("주가 데이터 생성 완료")

        # 4. 리포트 생성 (각 애널리스트가 담당 섹터 종목에 리포트)
        opinions = ["매수", "매수", "매수", "매수", "중립", "매도"]  # 매수 편향
        report_count = 0

        used_keys = set()  # (analyst_id, stock_id, report_date) 중복 방지
        for analyst in analysts:
            # 담당 섹터 종목 선택
            sector_stocks = [s for s in stocks if s.gics_sector == analyst.sector]
            if not sector_stocks:
                sector_stocks = random.sample(stocks, min(3, len(stocks)))

            for stock in sector_stocks:
                base = base_prices.get(stock.code, 100000)
                # 최근 12개월간 3~6건 리포트
                num_reports = random.randint(3, 6)
                for _ in range(num_reports):
                    report_date = today - timedelta(days=random.randint(7, 365))
                    if report_date.weekday() >= 5:
                        report_date -= timedelta(days=report_date.weekday() - 4)

                    key = (analyst.id, stock.id, report_date)
                    if key in used_keys:
                        continue
                    used_keys.add(key)

                    opinion = random.choice(opinions)
                    price_at_report = _random_price(base)
                    target = _random_target(price_at_report, opinion)

                    # 추적 가격 계산
                    price_1m = _random_price(price_at_report) if (today - report_date).days > 30 else None
                    price_3m = _random_price(price_at_report) if (today - report_date).days > 91 else None
                    price_6m = _random_price(price_at_report) if (today - report_date).days > 182 else None
                    price_12m = _random_price(price_at_report) if (today - report_date).days > 365 else None

                    # 목표가 달성 여부
                    achieved = None
                    if opinion == "매수" and price_3m:
                        achieved = price_3m >= target or (price_6m and price_6m >= target)
                    elif opinion == "매도" and price_3m:
                        achieved = price_3m <= target or (price_6m and price_6m <= target)

                    # 초과수익률 (간이 계산)
                    er_3m = None
                    if price_3m and price_at_report:
                        stock_ret = (price_3m - price_at_report) / price_at_report
                        sector_ret = random.uniform(-0.05, 0.05)
                        er_3m = round(stock_ret - sector_ret, 4)

                    report = Report(
                        analyst_id=analyst.id,
                        stock_id=stock.id,
                        title=f"{stock.name} {opinion} 리포트",
                        opinion=opinion,
                        target_price=target,
                        report_date=report_date,
                        price_at_report=price_at_report,
                        price_1m=price_1m,
                        price_3m=price_3m,
                        price_6m=price_6m,
                        price_12m=price_12m,
                        target_achieved=achieved,
                        excess_return_3m=er_3m,
                        source_url=f"https://markets.hankyung.com/stock/{stock.code}/consensus",
                    )
                    db.add(report)
                    report_count += 1

        await db.flush()
        print(f"리포트 {report_count}건 생성")

        # 5. 게시판 생성
        for slug, name, board_type in BOARDS:
            board = Board(slug=slug, name=name, board_type=board_type)
            db.add(board)
        await db.flush()
        print(f"게시판 {len(BOARDS)}개 생성")

        await db.commit()
        print("시드 데이터 생성 완료!")

    # 6. 랭킹 계산
    print("랭킹 계산 중...")
    from app.services.analysis.scorer import calculate_and_save_rankings
    async with AsyncSessionLocal() as db:
        for period in ("1m", "3m", "6m", "12m"):
            count = await calculate_and_save_rankings(db, period)
            print(f"  [{period}] {count}명 랭킹 저장")

    print("완료!")


if __name__ == "__main__":
    asyncio.run(seed())
