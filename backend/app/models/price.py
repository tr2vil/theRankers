from datetime import date, datetime

from sqlalchemy import Integer, Float, Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Price(Base):
    __tablename__ = "prices"
    __table_args__ = (
        UniqueConstraint("stock_id", "date", name="uq_price"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    open_price: Mapped[int] = mapped_column(Integer)
    high_price: Mapped[int] = mapped_column(Integer)
    low_price: Mapped[int] = mapped_column(Integer)
    close_price: Mapped[int] = mapped_column(Integer)
    volume: Mapped[int] = mapped_column(Integer)
    adjusted_close: Mapped[float] = mapped_column(Float)  # 수정주가

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    stock: Mapped["Stock"] = relationship(back_populates="prices")
