from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db

from utils.helper import verify_token


from schemas.user_plan_schema import CreatePlanRequest
from schemas.user_plan_schema import UpdatePlanRequest

from services.plan_service import create_plan_service
from services.plan_service import get_plans_service
from services.plan_service import update_plan_service
from services.plan_service import delete_plan_service


router = APIRouter()



@router.post("/")
async def create_plan(plan: CreatePlanRequest, payload: dict = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    return await create_plan_service(plan, payload["user_id"], db)


@router.get("/")
async def get_plans(payload: dict = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    return await get_plans_service(payload["user_id"], db)


@router.patch("/{plan_id}")
async def update_plan(plan_id: int, plan: UpdatePlanRequest, payload: dict = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    return await update_plan_service(plan_id, payload["user_id"], plan, db)


@router.delete("/{plan_id}")
async def delete_plan(plan_id: int, payload: dict = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    return await delete_plan_service(plan_id, payload["user_id"], db)