from datetime import datetime

from pydantic import BaseModel


class AnalystBase(BaseModel):
    name: str
    firm: str
    sector: str | None = None


class AnalystResponse(AnalystBase):
    id: int
    image_url: str | None
    total_reports: int
    accuracy_rate: float
    avg_return: float
    ranking_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalystListResponse(BaseModel):
    items: list[AnalystResponse]
    total: int
    page: int
    size: int
