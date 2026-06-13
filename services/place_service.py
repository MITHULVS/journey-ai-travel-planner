from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.place import Place

async def get_places_service(
    page: int,
    limit: int,
    search: str | None,
    continent: str | None,
    is_beach: bool | None,
    is_party: bool | None,
    is_metro: bool | None,
    is_nature: bool | None,
    is_family_friendly: bool | None,
    db: AsyncSession
):

    try:

        query = select(Place)

        if search:
            query = query.where(
                Place.name.ilike(f"%{search}%")
            )

        if continent:
            query = query.where(
                Place.continent.ilike(continent)
            )

        if is_beach is not None:
            query = query.where(
                Place.is_beach == is_beach
            )

        if is_party is not None:
            query = query.where(
                Place.is_party == is_party
            )

        if is_metro is not None:
            query = query.where(
                Place.is_metro == is_metro
            )

        if is_nature is not None:
            query = query.where(
                Place.is_nature == is_nature
            )

        if is_family_friendly is not None:
            query = query.where(
                Place.is_family_friendly == is_family_friendly
            )

        offset = (page - 1) * limit

        query = query.offset(offset).limit(limit)

        result = await db.execute(query)

        places = result.scalars().all()

        return {
            "page": page,
            "limit": limit,
            "count": len(places),
            "data": places
        }

    except HTTPException:
        raise

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )