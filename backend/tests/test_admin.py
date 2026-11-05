from tests.conftest import ADMIN_PASSWORD


async def test_admin_routes_require_auth(client):
    for path in ("/api/admin/orders", "/api/admin/products", "/api/admin/settings/whatsapp"):
        assert (await client.get(path)).status_code == 401
    bad = await client.get("/api/admin/orders", headers={"Authorization": "Bearer nope"})
    assert bad.status_code == 401


async def test_login_rejects_wrong_password_and_rate_limits(client):
    for _ in range(10):
        response = await client.post("/api/admin/login", json={"username": "admin", "password": "wrong"})
        assert response.status_code == 401
    response = await client.post("/api/admin/login", json={"username": "admin", "password": ADMIN_PASSWORD})
    assert response.status_code == 429


async def test_product_crud(client, admin_headers):
    payload = {
        "name_ar": "عسل السمر",
        "name_en": "Samar Honey",
        "price": 18.5,
        "weight": "500 غ",
        "image_url": "https://example.com/samar.jpg",
    }
    created = await client.post("/api/admin/products", json=payload, headers=admin_headers)
    assert created.status_code == 201
    product_id = created.json()["product"]["id"]

    updated = await client.put(f"/api/admin/products/{product_id}", json={"price": 19}, headers=admin_headers)
    assert updated.json()["product"]["price"] == 19

    assert (await client.delete(f"/api/admin/products/{product_id}", headers=admin_headers)).status_code == 204
    assert (await client.delete(f"/api/admin/products/{product_id}", headers=admin_headers)).status_code == 404


async def test_gallery_crud(client, admin_headers):
    payload = {"url": "https://example.com/a.jpg", "caption_ar": "صورة", "caption_en": "Photo", "order": 99}
    image = (await client.post("/api/admin/gallery", json=payload, headers=admin_headers)).json()["image"]
    payload["caption_en"] = "Updated"
    updated = await client.put(f"/api/admin/gallery/{image['id']}", json=payload, headers=admin_headers)
    assert updated.json()["image"]["caption_en"] == "Updated"
    assert (await client.delete(f"/api/admin/gallery/{image['id']}", headers=admin_headers)).status_code == 204


async def test_site_content_overrides_defaults(client, admin_headers):
    body = {"content_ar": {"title": "عنوان جديد"}, "content_en": {"title": "New title"}}
    assert (await client.put("/api/admin/site-content/hero", json=body, headers=admin_headers)).status_code == 200
    hero = (await client.get("/api/site-content")).json()["content"]["hero"]
    assert hero["ar"]["title"] == "عنوان جديد"
    assert hero["ar"]["cta"] == "اطلب الآن"  # untouched fields keep their defaults
    unknown = await client.put("/api/admin/site-content/evil", json=body, headers=admin_headers)
    assert unknown.status_code == 422


async def test_whatsapp_settings_never_expose_key(client, admin_headers):
    data = (await client.get("/api/admin/settings/whatsapp", headers=admin_headers)).json()
    assert data["has_api_key"] is True
    assert "test-key" not in str(data)

    response = await client.put(
        "/api/admin/settings/whatsapp", json={"admin_phone": "95555555", "api_key": ""}, headers=admin_headers
    )
    assert response.json()["admin_phone"] == "+96895555555"
    data = (await client.get("/api/admin/settings/whatsapp", headers=admin_headers)).json()
    assert data["has_api_key"] is True  # empty key keeps the existing one


async def test_password_change_invalidates_old_tokens(client, admin_headers):
    import asyncio

    await asyncio.sleep(1.1)  # tokens have second precision
    response = await client.post(
        "/api/admin/password",
        json={"current_password": ADMIN_PASSWORD, "new_password": "a-brand-new-password"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert (await client.get("/api/admin/me", headers=admin_headers)).status_code == 401
    new_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
    assert (await client.get("/api/admin/me", headers=new_headers)).status_code == 200
