from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db

from schemas.user_schema import UserSignup, UserLogin, TokenResponse

from services.auth_service import signup_service, login_service, logout_service


router = APIRouter()


@router.post("/signup")
async def signup(user: UserSignup, db: AsyncSession = Depends(get_db)):
    return await signup_service(user, db)


@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    return await login_service(user, db)


@router.post("/logout")
async def logout():
    return await logout_service()