from contextlib import asynccontextmanager
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference

from database import init_db

from routers.auth_route import router as auth_router
from routers.place_route import router as place_router
from routers.plan_route import router as plan_router

from models.user import User
from models.place import Place
from models.user_plan import UserPlan

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Journey API...")
    await init_db()

    yield

    print("Stopping Journey API...")


app = FastAPI(
    title="Journey Travel Planner API",
    version="1.0.0",
    description="AI-powered travel planning application",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://journey-frontend-ffgb.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()

    response = await call_next(request)

    end_time = time.perf_counter()

    print(
        f"{request.method} {request.url.path} "
        f"completed in {(end_time - start_time):.4f}s"
    )

    return response


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "message": "Journey Travel Planner API",
        "status": "running"
    }


@app.get("/scalar", include_in_schema=False)
def scalar():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="Journey API Documentation",
    )


app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    place_router,
    prefix="/places",
    tags=["Places"]
)

app.include_router(
    plan_router,
    prefix="/plans",
    tags=["Plans"]
)