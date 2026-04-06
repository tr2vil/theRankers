from datetime import date, datetime

from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: int
    analyst_id: int
    stock_id: int
    title: str | None
    opinion: str
    target_price: int
    previous_target_price: int | None
    report_date: date
    price_at_report: int | None
    target_achieved: bool | None
    excess_return_3m: float | None
    created_at: datetime

    # Joined fields
    analyst_name: str | None = None
    analyst_firm: str | None = None
    stock_name: str | None = None
    stock_code: str | None = None

    model_config = {"from_attributes": True}


class ReportListResponse(BaseModel):
    items: list[ReportResponse]
    total: int
    page: int
    size: int
