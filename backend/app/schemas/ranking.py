from datetime import date

from pydantic import BaseModel


class RankingEntry(BaseModel):
    rank: int
    analyst_id: int
    analyst_name: str
    analyst_firm: str
    analyst_image_url: str | None
    score: float
    target_hit_score: float
    excess_return_score: float
    direction_accuracy_score: float
    consistency_score: float
    total_reports: int
    accuracy_rate: float

    model_config = {"from_attributes": True}


class RankingResponse(BaseModel):
    period: str
    calculated_at: date | None
    items: list[RankingEntry]
    total: int
