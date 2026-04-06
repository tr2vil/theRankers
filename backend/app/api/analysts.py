from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.analyst import Analyst
from app.schemas.analyst import AnalystResponse, AnalystListResponse

router = APIRouter()


@router.get("", response_model=AnalystListResponse)
async def list_analysts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    firm: str | None = None,
    sector: str | None = None,
    sort_by: str = Query("ranking_score", pattern="^(ranking_score|accuracy_rate|total_reports|name)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Analyst)
    count_query = select(func.count(Analyst.id))

    if firm:
        query = query.where(Analyst.firm == firm)
        count_query = count_query.where(Analyst.firm == firm)
    if sector:
        query = query.where(Analyst.sector == sector)
        count_query = count_query.where(Analyst.sector == sector)

    sort_col = getattr(Analyst, sort_by)
    query = query.order_by(sort_col.desc() if order == "desc" else sort_col.asc())
    query = query.offset((page - 1) * size).limit(size)

    result = await db.execute(query)
    total_result = await db.execute(count_query)

    return AnalystListResponse(
        items=[AnalystResponse.model_validate(a) for a in result.scalars().all()],
        total=total_result.scalar_one(),
        page=page,
        size=size,
    )


@router.get("/{analyst_id}", response_model=AnalystResponse)
async def get_analyst(analyst_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analyst).where(Analyst.id == analyst_id))
    analyst = result.scalar_one_or_none()
    if not analyst:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Analyst not found")
    return AnalystResponse.model_validate(analyst)
