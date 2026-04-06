from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.ranking import Ranking
from app.models.analyst import Analyst
from app.schemas.ranking import RankingEntry, RankingResponse

router = APIRouter()


@router.get("", response_model=RankingResponse)
async def get_rankings(
    period: str = Query("12m", pattern="^(1m|3m|6m|12m)$"),
    sector: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    # Get latest calculation date for the period
    latest_date_result = await db.execute(
        select(func.max(Ranking.calculated_at)).where(Ranking.period == period)
    )
    latest_date = latest_date_result.scalar_one_or_none()

    if not latest_date:
        return RankingResponse(
            period=period,
            calculated_at=None,
            items=[],
            total=0,
        )

    query = (
        select(Ranking, Analyst)
        .join(Analyst, Ranking.analyst_id == Analyst.id)
        .where(Ranking.period == period, Ranking.calculated_at == latest_date)
    )

    if sector:
        query = query.where(Analyst.sector == sector)

    query = query.order_by(Ranking.rank).offset((page - 1) * size).limit(size)

    result = await db.execute(query)

    count_query = (
        select(func.count(Ranking.id))
        .join(Analyst, Ranking.analyst_id == Analyst.id)
        .where(Ranking.period == period, Ranking.calculated_at == latest_date)
    )
    if sector:
        count_query = count_query.where(Analyst.sector == sector)
    total_result = await db.execute(count_query)

    items = []
    for ranking, analyst in result.all():
        items.append(RankingEntry(
            rank=ranking.rank,
            analyst_id=analyst.id,
            analyst_name=analyst.name,
            analyst_firm=analyst.firm,
            analyst_image_url=analyst.image_url,
            score=ranking.score,
            target_hit_score=ranking.target_hit_score,
            excess_return_score=ranking.excess_return_score,
            direction_accuracy_score=ranking.direction_accuracy_score,
            consistency_score=ranking.consistency_score,
            total_reports=analyst.total_reports,
            accuracy_rate=analyst.accuracy_rate,
        ))

    return RankingResponse(
        period=period,
        calculated_at=latest_date,
        items=items,
        total=total_result.scalar_one(),
    )
