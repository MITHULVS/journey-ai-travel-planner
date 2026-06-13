from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship


from database import Base


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False, unique=True)

    continent = Column(String(50), nullable=False)

    image_url = Column(String(1000), nullable=False)

    is_beach = Column(Boolean, default=False)

    is_party = Column(Boolean, default=False)

    is_metro = Column(Boolean, default=False)

    is_nature = Column(Boolean, default=False)

    is_family_friendly = Column(Boolean, default=False)

    plans = relationship(
        "UserPlan",
        back_populates="place"
    )