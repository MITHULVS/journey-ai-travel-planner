from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


from database import Base


class UserPlan(Base):
    __tablename__ = "user_plans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    place_id = Column(
        Integer,
        ForeignKey("places.id", ondelete="CASCADE"),
        nullable=False
    )

    budget = Column(String(20), nullable=False)

    duration = Column(Integer, nullable=False)

    travel_type = Column(String(50), nullable=False)

    accommodation = Column(String(50), nullable=False)

    interests = Column(Text, nullable=True)

    custom_requirements = Column(Text, nullable=True)

    generated_plan = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship(
        "User",
        back_populates="plans"
    )

    place = relationship(
        "Place",
        back_populates="plans"
    )