"""Test fixtures. Requires a MongoDB server (TEST_MONGO_URL, default mongodb://localhost:27017)."""

import os
import re
import uuid

import httpx
import pytest

os.environ.setdefault("JWT_SECRET", "test-secret-" + "x" * 32)
os.environ.setdefault("MONGO_URL", os.environ.get("TEST_MONGO_URL", "mongodb://localhost:27017"))
os.environ.setdefault("DB_NAME", "honey_farm_import_guard")

from app.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402

ADMIN_PASSWORD = "correct-horse-battery"


class FakeWhatsApp:
    def __init__(self) -> None:
        self.messages: list[tuple[str, str]] = []
        self.fail = False

    async def send(self, config, recipient: str, text: str) -> bool:
        if self.fail:
            return False
        self.messages.append((recipient, text))
        return True

    async def aclose(self) -> None:
        pass

    def last_otp(self) -> str:
        for _, text in reversed(self.messages):
            if match := re.search(r"\*(\d{6})\*", text):
                return match.group(1)
        raise AssertionError("no OTP message sent")


@pytest.fixture
def settings() -> Settings:
    return Settings(
        environment="test",
        mongo_url=os.environ["MONGO_URL"],
        db_name=f"honey_test_{uuid.uuid4().hex[:8]}",
        jwt_secret="test-secret-" + "x" * 32,
        admin_password=ADMIN_PASSWORD,
        admin_phone="+96890000000",
        whatsapp_api_key="test-key",
        admin_notification_delay_seconds=0,
    )


@pytest.fixture
async def app(settings):
    application = create_app(settings)
    async with application.router.lifespan_context(application):
        application.state.whatsapp = FakeWhatsApp()
        yield application
        await application.state.db.client.drop_database(settings.db_name)


@pytest.fixture
async def client(app):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
def whatsapp(app) -> FakeWhatsApp:
    return app.state.whatsapp


@pytest.fixture
async def admin_headers(client) -> dict:
    response = await client.post("/api/admin/login", json={"username": "admin", "password": ADMIN_PASSWORD})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture
async def product(client) -> dict:
    products = (await client.get("/api/products")).json()["products"]
    return products[0]
