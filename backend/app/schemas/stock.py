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
