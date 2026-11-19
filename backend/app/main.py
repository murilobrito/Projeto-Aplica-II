from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import (
    auth,
    categorias,
    classificar,
    cooperativa,
    correcoes,
    dashboard,
    dispositivos,
    usuarios,
)
from app.seed import seed
from app.storage import PASTA_UPLOADS


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed()
    yield


app = FastAPI(title="EcoTriagem API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PASTA_UPLOADS.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=PASTA_UPLOADS), name="uploads")

for modulo in (auth, categorias, classificar, cooperativa, correcoes, dashboard, dispositivos, usuarios):
    app.include_router(modulo.router)


@app.get("/", tags=["status"])
def raiz():
    return {
        "servico": "EcoTriagem API",
        "docs": "/docs",
        "inferencia": settings.inference_mode,
    }
