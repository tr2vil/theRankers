from datetime import datetime

from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    market: Mapped[str] = mapped_column(String(10))  # KOSPI / KOSDAQ
    gics_sector: Mapped[str | None] = mapped_column(String(100), index=True)
    gics_sector_code: Mapped[str | None] = mapped_column(String(10))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    reports: Mapped[list["Report"]] = relationship(back_populates="stock")
    prices: Mapped[list["Price"]] = relationship(back_populates="stock")
