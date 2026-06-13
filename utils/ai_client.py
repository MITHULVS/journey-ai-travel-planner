import os
import httpx

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


async def generate_travel_plan(prompt: str):

    async with httpx.AsyncClient(timeout=60) as client:

        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {
                        "role": "system",
                        "content": """
You are Journey AI, a professional travel planning assistant.

Generate personalized travel plans based on the information provided by the user.

Rules:
- Create realistic travel itineraries.
- Respect the user's budget and duration.
- Consider travel type, accommodation preferences, interests, and additional requirements.
- Organize the itinerary day by day when appropriate.
- Recommend attractions, activities, food options, and travel tips.
- Keep the plan concise, practical, and easy to read.
- Do not explain your reasoning.
- Do not mention that you are an AI.
- Return only the travel plan.
"""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
        )

        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]