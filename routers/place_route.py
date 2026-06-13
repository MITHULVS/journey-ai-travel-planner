from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db

from utils.helper import verify_token

from services.place_service import get_places_service


router = APIRouter()


@router.get("/")
async def get_places(page: int = Query(1), limit: int = Query(12), search: str | None = None, continent: str | None = None, is_beach: bool | None = None, is_party: bool | None = None, is_metro: bool | None = None, is_nature: bool | None = None, is_family_friendly: bool | None = None, payload: dict = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    return await get_places_service(page, limit, search, continent, is_beach, is_party, is_metro, is_nature, is_family_friendly, db)