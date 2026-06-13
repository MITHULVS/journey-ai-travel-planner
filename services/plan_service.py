from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.place import Place
from models.user_plan import UserPlan

from utils.ai_client import generate_travel_plan



async def create_plan_service(plan, user_id, db: AsyncSession):

    try:

        result = await db.execute(
            select(Place).where(
                Place.id == plan.place_id
            )
        )

        place = result.scalar_one_or_none()

        if not place:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Place not found"
            )

        prompt = f"""
Country: {place.name}

Budget: {plan.budget}

Duration: {plan.duration} days

Travel Type: {plan.travel_type}

Accommodation: {plan.accommodation}

Interests: {", ".join(plan.interests)}

Additional Requirements:
{plan.custom_requirements}
"""

        generated_plan = await generate_travel_plan(prompt)

        new_plan = UserPlan(
            user_id=user_id,
            place_id=plan.place_id,
            budget=plan.budget,
            duration=plan.duration,
            travel_type=plan.travel_type,
            accommodation=plan.accommodation,
            interests=", ".join(plan.interests),
            custom_requirements=plan.custom_requirements,
            generated_plan=generated_plan
        )

        db.add(new_plan)

        await db.commit()

        await db.refresh(new_plan)

        return {
            "message": "Plan created successfully",
            "plan_id": new_plan.id,
            "generated_plan": generated_plan
        }

    except HTTPException:
        raise

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to create plan"
        )

async def get_plans_service(user_id: int, db: AsyncSession):

    try:

        result = await db.execute(
            select(UserPlan).where(
                UserPlan.user_id == user_id
            )
        )

        plans = result.scalars().all()

        return plans

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch plans"
        )


async def update_plan_service(plan_id: int, user_id: int, plan, db: AsyncSession):

    try:

        result = await db.execute(
            select(UserPlan).where(
                UserPlan.id == plan_id,
                UserPlan.user_id == user_id
            )
        )

        existing_plan = result.scalar_one_or_none()

        if not existing_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )

        place_result = await db.execute(
            select(Place).where(
                Place.id == existing_plan.place_id
            )
        )

        place = place_result.scalar_one_or_none()

        if not place:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Place not found"
            )

        existing_plan.budget = plan.budget
        existing_plan.duration = plan.duration
        existing_plan.travel_type = plan.travel_type
        existing_plan.accommodation = plan.accommodation
        existing_plan.interests = ", ".join(plan.interests)
        existing_plan.custom_requirements = plan.custom_requirements

        prompt = f"""
Country: {place.name}

Budget: {plan.budget}

Duration: {plan.duration} days

Travel Type: {plan.travel_type}

Accommodation: {plan.accommodation}

Interests: {", ".join(plan.interests)}

Additional Requirements:
{plan.custom_requirements}
"""

        generated_plan = await generate_travel_plan(prompt)

        existing_plan.generated_plan = generated_plan

        await db.commit()

        await db.refresh(existing_plan)

        return {
            "message": "Plan updated successfully",
            "generated_plan": generated_plan
        }

    except HTTPException:
        raise

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to update plan"
        )


async def delete_plan_service(plan_id: int, user_id: int, db: AsyncSession):

    try:

        result = await db.execute(
            select(UserPlan).where(
                UserPlan.id == plan_id,
                UserPlan.user_id == user_id
            )
        )

        plan = result.scalar_one_or_none()

        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )

        await db.delete(plan)

        await db.commit()

        return {
            "message": "Plan deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to delete plan"
        )