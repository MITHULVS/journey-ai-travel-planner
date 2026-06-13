from pydantic import BaseModel
from datetime import datetime


class GeneratePlanRequest(BaseModel):
    place_id: int
    budget: str
    duration: int
    travel_type: str
    accommodation: str
    interests: list[str]
    custom_requirements: str | None = None


class GeneratePlanResponse(BaseModel):
    generated_plan: str


class CreatePlanRequest(BaseModel):
    place_id: int
    budget: str
    duration: int
    travel_type: str
    accommodation: str
    interests: list[str]
    custom_requirements: str | None = None


class UpdatePlanRequest(BaseModel):
    budget: str
    duration: int
    travel_type: str
    accommodation: str
    interests: list[str]
    custom_requirements: str | None = None


class PlanResponse(BaseModel):
    id: int
    user_id: int
    place_id: int

    budget: str
    duration: int
    travel_type: str
    accommodation: str

    interests: str | None
    custom_requirements: str | None

    generated_plan: str

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlanListResponse(BaseModel):
    id: int
    place_id: int
    generated_plan: str
    created_at: datetime

    class Config:
        from_attributes = True