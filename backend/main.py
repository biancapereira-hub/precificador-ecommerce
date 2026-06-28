"""API do Precificador E-commerce (FastAPI)."""

from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.research import research_product

app = FastAPI(title="Precificador E-commerce API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    productName: str = Field(min_length=2, max_length=200)
    extraNotes: str | None = Field(default=None, max_length=500)


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok", "service": "precificador-backend"}


@app.get("/health")
@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/research")
async def research(payload: ResearchRequest) -> dict:
    try:
        return await research_product(payload.productName, payload.extraNotes)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail="Não foi possível concluir a pesquisa. Tente novamente.",
        ) from exc
