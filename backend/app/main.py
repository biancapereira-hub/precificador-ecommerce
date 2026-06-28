"""Compatibilidade: expõe o app FastAPI também em app.main:app."""

from main import app

__all__ = ["app"]
