"""스코어링 엔진.

애널리스트 성과를 4개 지표로 평가한다:
- 목표가 달성률 (35%)
- 투자의견 초과수익률 (30%)
- 수익률 방향 정확도 (20%)
- 일관성 (15%)
"""

import math
import logging
from datetime import date, timedelta
from dataclasses import dataclass

from sqlalchemy import select, delete, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analyst import Analyst
from app.models.report import Report
from app.models.ranking import Ranking

logger = logging.getLogger(__name__)

# 가중치
W_TARGET_HIT = 35.0
W_EXCESS_RETURN = 30.0
W_DIRECTION = 20.0
W_CONSISTENCY = 15.0

# 최소 리포트 수
MIN_REPORTS = 3

# 기간 매핑 (일수)
PERIOD_DAYS = {"1m": 30, "3m": 91, "6m": 182, "12m": 365}


@dataclass
class AnalystScore:
    analyst_id: int
    target_hit_score: float
    excess_return_score: float
    direction_accuracy_score: float
    consistency_score: float
    total_score: float
    report_count: int
    accuracy_rate: float


def _return_field(period: str) -> str:
    """기간에 맞는 수익률 필드명을 반환한다."""
    mapping = {"1m": "price_1m", "3m": "price_3m", "6m": "price_6m", "12m": "price_12m"}
    return mapping.get(period, "price_3m")


def _excess_return_field(period: str) -> str:
    mapping = {"1m": "excess_return_1m", "3m": "excess_return_3m",
               "6m": "excess_return_6m", "12m": "excess_return_12m"}
    return mapping.get(period, "excess_return_3m")


async def calculate_analyst_scores(
    db: AsyncSession,
    period: str = "12m",
) -> list[AnalystScore]:
    """모든 애널리스트의 점수를 계산한다."""
    days = PERIOD_DAYS.get(period, 365)
    cutoff_date = date.today() - timedelta(days=days)
    price_field = _return_field(period)

    # 기간 내 리포트가 있는 애널리스트 조회
    analyst_ids_result = await db.execute(
        select(Report.analyst_id, func.count(Report.id))
        .where(Report.report_date >= cutoff_date)
        .group_by(Report.analyst_id)
        .having(func.count(Report.id) >= MIN_REPORTS)
    )
    analyst_report_counts = {row[0]: row[1] for row in analyst_ids_result.all()}

    if not analyst_report_counts:
        return []

    scores = []
    for analyst_id, report_count in analyst_report_counts.items():
        # 해당 애널리스트의 기간 내 리포트
        result = await db.execute(
            select(Report)
            .where(Report.analyst_id == analyst_id, Report.report_date >= cutoff_date)
        )
        reports = result.scalars().all()

        score = _compute_scores(reports, period)
        if score:
            score.analyst_id = analyst_id
            score.report_count = report_count
            scores.append(score)

    return scores


def _compute_scores(reports: list[Report], period: str) -> AnalystScore | None:
    """단일 애널리스트의 리포트들로 점수를 계산한다."""
    if len(reports) < MIN_REPORTS:
        return None

    price_field = _return_field(period)
    excess_field = _excess_return_field(period)

    # 1. 목표가 달성률 (35점)
    target_hit_count = sum(1 for r in reports if r.target_achieved is True)
    evaluable_reports = [r for r in reports if r.target_achieved is not None]
    target_hit_rate = target_hit_count / len(evaluable_reports) if evaluable_reports else 0
    target_hit_score = target_hit_rate * W_TARGET_HIT

    # 2. 투자의견 초과수익률 (30점)
    excess_returns = []
    for r in reports:
        er = getattr(r, excess_field, None)
        if er is not None:
            # 매도 의견은 초과수익률 부호 반전
            if r.opinion == "매도":
                er = -er
            excess_returns.append(er)

    avg_excess = sum(excess_returns) / len(excess_returns) if excess_returns else 0
    # 초과수익률을 0~30 범위로 정규화 (상대평가에서 사용)
    excess_return_raw = avg_excess

    # 3. 수익률 방향 정확도 (20점)
    direction_correct = 0
    direction_total = 0
    for r in reports:
        future_price = getattr(r, price_field, None)
        if future_price is None or r.price_at_report is None:
            continue
        actual_return = (future_price - r.price_at_report) / r.price_at_report

        direction_total += 1
        if r.opinion == "매수" and actual_return > 0:
            direction_correct += 1
        elif r.opinion == "매도" and actual_return < 0:
            direction_correct += 1
        elif r.opinion == "중립" and abs(actual_return) < 0.05:
            direction_correct += 1

    direction_rate = direction_correct / direction_total if direction_total else 0
    direction_score = direction_rate * W_DIRECTION

    # 4. 일관성 (15점)
    returns = []
    for r in reports:
        future_price = getattr(r, price_field, None)
        if future_price and r.price_at_report:
            ret = (future_price - r.price_at_report) / r.price_at_report
            returns.append(ret)

    if len(returns) >= 2:
        mean_ret = sum(returns) / len(returns)
        variance = sum((x - mean_ret) ** 2 for x in returns) / len(returns)
        std = math.sqrt(variance)
        consistency_raw = 1 / (1 + std)
    else:
        consistency_raw = 0.5

    consistency_score = consistency_raw * W_CONSISTENCY

    # 정확도 (방향 정확도와 동일)
    accuracy_rate = direction_rate * 100

    return AnalystScore(
        analyst_id=0,
        target_hit_score=round(target_hit_score, 2),
        excess_return_score=round(excess_return_raw, 4),  # 상대평가 전 원시값
        direction_accuracy_score=round(direction_score, 2),
        consistency_score=round(consistency_score, 2),
        total_score=0,  # 상대평가 후 계산
        report_count=len(reports),
        accuracy_rate=round(accuracy_rate, 1),
    )


async def calculate_and_save_rankings(db: AsyncSession, period: str = "12m") -> int:
    """스코어를 계산하고 랭킹을 DB에 저장한다."""
    scores = await calculate_analyst_scores(db, period)
    if not scores:
        logger.info(f"[{period}] 랭킹 대상 애널리스트 없음")
        return 0

    # 초과수익률 상대평가 (최고값 = 30점)
    if scores:
        max_excess = max(s.excess_return_score for s in scores)
        min_excess = min(s.excess_return_score for s in scores)
        excess_range = max_excess - min_excess if max_excess != min_excess else 1

        for s in scores:
            normalized = (s.excess_return_score - min_excess) / excess_range
            s.excess_return_score = round(normalized * W_EXCESS_RETURN, 2)

    # 총점 계산
    for s in scores:
        s.total_score = round(
            s.target_hit_score + s.excess_return_score +
            s.direction_accuracy_score + s.consistency_score,
            2,
        )

    # 총점 순 정렬
    scores.sort(key=lambda s: s.total_score, reverse=True)

    today = date.today()

    # 기존 랭킹 삭제 (같은 기간, 같은 날짜)
    await db.execute(
        delete(Ranking)
        .where(Ranking.period == period, Ranking.calculated_at == today)
    )

    # 랭킹 저장
    saved = 0
    for rank, score in enumerate(scores, 1):
        ranking = Ranking(
            analyst_id=score.analyst_id,
            period=period,
            rank=rank,
            score=score.total_score,
            target_hit_score=score.target_hit_score,
            excess_return_score=score.excess_return_score,
            direction_accuracy_score=score.direction_accuracy_score,
            consistency_score=score.consistency_score,
            calculated_at=today,
        )
        db.add(ranking)

        # 애널리스트 집계 지표 업데이트
        result = await db.execute(
            select(Analyst).where(Analyst.id == score.analyst_id)
        )
        analyst = result.scalar_one_or_none()
        if analyst:
            analyst.ranking_score = score.total_score
            analyst.accuracy_rate = score.accuracy_rate
            analyst.total_reports = score.report_count

        saved += 1

    await db.commit()
    logger.info(f"[{period}] {saved}명 랭킹 저장 완료")
    return saved
