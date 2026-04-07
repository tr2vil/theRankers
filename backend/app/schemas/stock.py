from datetime import datetime

from pydantic import BaseModel


class PricePoint(BaseModel):
    date: datetime
    close_price: int
    volume: int

    model_config = {"from_attributes": True}


class StockResponse(BaseModel):
    id: int
    code: str
    name: str
    market: str
    gics_sector: str | None
    gics_sector_code: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class StockListResponse(BaseModel):
    items: list[StockResponse]
    total: int
    page: int
    size: int


class AnalystOpinion(BaseModel):
    """종목 forecast 페이지의 개별 애널리스트 의견."""
    report_id: int
    analyst_id: int
    analyst_name: str
    analyst_firm: str
    opinion: str
    target_price: int
    report_date: str
    ranking_score: float
    accuracy_rate: float
    avg_return: float
    total_reports: int


class StockForecast(BaseModel):
    """종목 forecast 전체 데이터."""
    stock: "StockResponse"
    # Consensus
    buy_count: int
    hold_count: int
    sell_count: int
    avg_target_price: float
    high_target_price: int | None
    low_target_price: int | None
    current_price: int | None
    report_count: int
    # Analyst opinions
    opinions: list[AnalystOpinion]
    # Best analyst
    best_analyst: AnalystOpinion | None


class StockConsensus(BaseModel):
    stock: StockResponse
    buy_count: int
    hold_count: int
    sell_count: int
    avg_target_price: float
    high_target_price: int | None
    low_target_price: int | None
    current_price: int | None
    report_count: int
