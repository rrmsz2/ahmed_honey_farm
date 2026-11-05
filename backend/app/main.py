"""FastAPI application entry point: `uvicorn app.main:app`."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Settings, get_settings
from app.db import create_client, ensure_indexes
from app.routers import admin, public
from app.services.seed import bootstrap
from app.services.whatsapp import WhatsAppClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("honey_farm")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        client = create_client(settings)
        app.state.db = client[settings.db_name]
        app.state.whatsapp = WhatsAppClient(settings)
        await ensure_indexes(app.state.db, settings)
        await bootstrap(app.state.db, settings)
        logger.info("Honey Farm API started (environment=%s)", settings.environment)
        try:
            yield
        finally:
            await app.state.whatsapp.aclose()
            await client.close()

    app = FastAPI(
        title="Ahmad Honey Farm API",
        version="2.0.0",
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/api/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/api/openapi.json",
    )
    app.state.settings = settings

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_methods=["GET", "POST", "PUT", "DELETE"],
            allow_headers=["Authorization", "Content-Type"],
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        # Surface the first human-readable message (our validators raise Arabic messages).
        errors = [{"loc": list(e.get("loc", ())), "msg": str(e.get("msg", ""))} for e in exc.errors()]
        message = errors[0]["msg"].removeprefix("Value error, ") if errors else "بيانات غير صالحة"
        return JSONResponse(status_code=422, content={"detail": message, "errors": errors})

    app.include_router(public.router, prefix="/api")
    app.include_router(admin.router, prefix="/api")
    return app


app = create_app()
