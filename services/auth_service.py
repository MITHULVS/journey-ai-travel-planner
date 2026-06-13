from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User

from schemas.user_schema import UserSignup
from schemas.user_schema import UserLogin

from utils.helper import hash_password,verify_password,create_access_token

import httpx


async def signup_service(user: UserSignup, db: AsyncSession):

    try:

        result = await db.execute(
            select(User).where(User.email == user.email)
        )

        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )



        new_user = User(
            name=user.name,
            email=user.email,
            password_hash=hash_password(user.password)
        )

        try:

            async with httpx.AsyncClient() as client:

                await client.post(
                    "http://localhost:5678/webhook-test/f44aaae3-2b46-4edf-80c7-c8c94a7732b3",
                    json={
                        "name": user.name,
                        "email": user.email
                    }
                )

        except Exception as e:
            print(f"Email workflow failed: {e}")

        db.add(new_user)

        await db.commit()

        await db.refresh(new_user)

        return {
            "message": "User created successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


async def login_service(user: UserLogin, db: AsyncSession):

    try:

        result = await db.execute(
            select(User).where(User.email == user.email)
        )

        existing_user = result.scalar_one_or_none()

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        if not verify_password(
            user.password,
            existing_user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        token = create_access_token(
            {
                "user_id": existing_user.id,
                "email": existing_user.email
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


async def logout_service():

    try:

        return {
            "message": "Logged out successfully"
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )