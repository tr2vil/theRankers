from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.report import Report
from app.models.analyst import Analyst
from app.models.stock import Stock
from app.schemas.report import ReportResponse, ReportListResponse

router = APIRouter()


@router.get("", response_model=ReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    analyst_id: int | None = None,
    stock_id: int | None = None,
    opinion: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Report, Analyst.name, Analyst.firm, Stock.name, Stock.code)
        .join(Analyst, Report.analyst_id == Analyst.id)
        .join(Stock, Report.stock_id == Stock.id)
    )
    count_query = select(func.count(Report.id))

    if analyst_id:
        query = query.where(Report.analyst_id == analyst_id)
        count_query = count_query.where(Report.analyst_id == analyst_id)
    if stock_id:
        query = query.where(Report.stock_id == stock_id)
        count_query = count_query.where(Report.stock_id == stock_id)
    if opinion:
        query = query.where(Report.opinion == opinion)
        count_query = count_query.where(Report.opinion == opinion)
    if date_from:
        query = query.where(Report.report_date >= date_from)
        count_query = count_query.where(Report.report_date >= date_from)
    if date_to:
        query = query.where(Report.report_date <= date_to)
        count_query = count_query.where(Report.report_date <= date_to)

    query = query.order_by(Report.report_date.desc())
    query = query.offset((page - 1) * size).limit(size)

    result = await db.execute(query)
    total_result = await db.execute(count_query)

    items = []
    for row in result.all():
        report, analyst_name, analyst_firm, stock_name, stock_code = row
        resp = ReportResponse.model_validate(report)
        resp.analyst_name = analyst_name
        resp.analyst_firm = analyst_firm
        resp.stock_name = stock_name
        resp.stock_code = stock_code
        items.append(resp)

    return ReportListResponse(
        items=items,
        total=total_result.scalar_one(),
        page=page,
        size=size,
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report, Analyst.name, Analyst.firm, Stock.name, Stock.code)
        .join(Analyst, Report.analyst_id == Analyst.id)
        .join(Stock, Report.stock_id == Stock.id)
        .where(Report.id == report_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Report not found")

    report, analyst_name, analyst_firm, stock_name, stock_code = row
    resp = ReportResponse.model_validate(report)
    resp.analyst_name = analyst_name
    resp.analyst_firm = analyst_firm
    resp.stock_name = stock_name
    resp.stock_code = stock_code
    return resp
