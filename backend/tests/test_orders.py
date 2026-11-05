import pytest


def order_payload(product_id: str, quantity: int = 2, phone: str = "91234567") -> dict:
    return {
        "customer_name": "سالم",
        "customer_phone": phone,
        "items": [{"product_id": product_id, "quantity": quantity}],
    }


async def test_health(client):
    response = await client.get("/api/health")
    assert response.json() == {"status": "ok"}


async def test_public_catalogue_is_seeded(client):
    assert len((await client.get("/api/products")).json()["products"]) == 3
    assert len((await client.get("/api/gallery")).json()["images"]) == 6
    content = (await client.get("/api/site-content")).json()["content"]
    assert set(content) == {"hero", "story", "contact", "footer"}
    assert content["contact"]["ar"]["phone"] == "+96890000000"


async def test_total_is_computed_server_side(client, product):
    payload = order_payload(product["id"], quantity=3)
    payload["items"][0]["price"] = 0.001  # extra fields are rejected outright
    assert (await client.post("/api/orders", json=payload)).status_code == 422

    response = await client.post("/api/orders", json=order_payload(product["id"], quantity=3))
    assert response.status_code == 201
    assert response.json()["total"] == round(product["price"] * 3, 3)


async def test_full_order_flow(client, whatsapp, product, admin_headers):
    created = (await client.post("/api/orders", json=order_payload(product["id"]))).json()
    assert whatsapp.messages[0][0] == "+96891234567"

    # Unverified orders are hidden from the admin list.
    listed = (await client.get("/api/admin/orders", headers=admin_headers)).json()
    assert listed["total"] == 0

    verified = await client.post(
        "/api/orders/verify-otp", json={"order_id": created["order_id"], "otp": whatsapp.last_otp()}
    )
    assert verified.status_code == 200, verified.text
    assert verified.json()["order"]["status"] == "confirmed"

    recipients = [r for r, _ in whatsapp.messages]
    assert recipients == ["+96891234567", "+96891234567", "+96890000000"]
    assert created["number"] in whatsapp.messages[-1][1]

    stats = (await client.get("/api/admin/orders/stats", headers=admin_headers)).json()
    assert stats["by_status"]["confirmed"] == 1
    assert stats["total_revenue"] == created["total"]

    again = await client.post("/api/orders/verify-otp", json={"order_id": created["order_id"], "otp": "000000"})
    assert again.status_code == 409


async def test_otp_attempts_are_limited(client, whatsapp, product):
    order_id = (await client.post("/api/orders", json=order_payload(product["id"]))).json()["order_id"]
    real = whatsapp.last_otp()
    wrong = "000000" if real != "000000" else "111111"
    for _ in range(5):
        response = await client.post("/api/orders/verify-otp", json={"order_id": order_id, "otp": wrong})
        assert response.status_code == 400
    response = await client.post("/api/orders/verify-otp", json={"order_id": order_id, "otp": real})
    assert response.status_code == 429


async def test_resend_has_cooldown(client, product):
    order_id = (await client.post("/api/orders", json=order_payload(product["id"]))).json()["order_id"]
    response = await client.post("/api/orders/resend-otp", json={"order_id": order_id})
    assert response.status_code == 429


@pytest.mark.parametrize("phone", ["12345678", "+97191234567", "9123"])
async def test_rejects_invalid_phone(client, product, phone):
    response = await client.post("/api/orders", json=order_payload(product["id"], phone=phone))
    assert response.status_code == 422
    assert "رقم" in response.json()["detail"]


async def test_unknown_or_unavailable_product(client, product, admin_headers):
    response = await client.post("/api/orders", json=order_payload("does-not-exist"))
    assert response.status_code == 422
    await client.put(f"/api/admin/products/{product['id']}", json={"available": False}, headers=admin_headers)
    assert (await client.post("/api/orders", json=order_payload(product["id"]))).status_code == 422


async def test_order_removed_when_whatsapp_fails(client, whatsapp, product, app):
    whatsapp.fail = True
    response = await client.post("/api/orders", json=order_payload(product["id"]))
    assert response.status_code == 502
    assert await app.state.db.orders.count_documents({}) == 0


async def test_orders_per_phone_rate_limit(client, product):
    for _ in range(5):
        assert (await client.post("/api/orders", json=order_payload(product["id"]))).status_code == 201
    assert (await client.post("/api/orders", json=order_payload(product["id"]))).status_code == 429
