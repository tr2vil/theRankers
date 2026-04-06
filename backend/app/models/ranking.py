from datetime import date, datetime

from sqlalchemy import Integer, Float, String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Ranking(Base):
    __tablename__ = "rankings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analyst_id: Mapped[int] = mapped_column(ForeignKey("analysts.id"), index=True)
    period: Mapped[str] = mapped_column(String(10), index=True)  # 1m, 3m, 6m, 12m
    rank: Mapped[int] = mapped_column(Integer)
    score: Mapped[float] = mapped_column(Float)

    # Score breakdown
    target_hit_score: Mapped[float] = mapped_column(Float, default=0.0)
    excess_return_score: Mapped[float] = mapped_column(Float, default=0.0)
    direction_accuracy_score: Mapped[float] = mapped_column(Float, default=0.0)
    consistency_score: Mapped[float] = mapped_column(Float, default=0.0)

    calculated_at: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    analyst: Mapped["Analyst"] = relationship(back_populates="rankings")
