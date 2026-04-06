from datetime import date, datetime

from sqlalchemy import (
    String, Integer, Float, Date, DateTime, Boolean, ForeignKey,
    UniqueConstraint, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        UniqueConstraint("analyst_id", "stock_id", "report_date", name="uq_report"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analyst_id: Mapped[int] = mapped_column(ForeignKey("analysts.id"), index=True)
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id"), index=True)

    # Report content
    title: Mapped[str | None] = mapped_column(String(500))
    opinion: Mapped[str] = mapped_column(String(20))  # 매수 / 중립 / 매도
    target_price: Mapped[int] = mapped_column(Integer)
    previous_target_price: Mapped[int | None] = mapped_column(Integer)
    report_date: Mapped[date] = mapped_column(Date, index=True)
    source_url: Mapped[str | None] = mapped_column(String(1000))

    # Price at report time
    price_at_report: Mapped[int | None] = mapped_column(Integer)

    # Tracked prices (filled by tracker)
    price_1m: Mapped[int | None] = mapped_column(Integer)
    price_3m: Mapped[int | None] = mapped_column(Integer)
    price_6m: Mapped[int | None] = mapped_column(Integer)
    price_12m: Mapped[int | None] = mapped_column(Integer)

    # Target achievement
    target_achieved: Mapped[bool | None] = mapped_column(Boolean)
    achieved_date: Mapped[date | None] = mapped_column(Date)

    # Excess return (vs sector index)
    excess_return_1m: Mapped[float | None] = mapped_column(Float)
    excess_return_3m: Mapped[float | None] = mapped_column(Float)
    excess_return_6m: Mapped[float | None] = mapped_column(Float)
    excess_return_12m: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    analyst: Mapped["Analyst"] = relationship(back_populates="reports")
    stock: Mapped["Stock"] = relationship(back_populates="reports")
