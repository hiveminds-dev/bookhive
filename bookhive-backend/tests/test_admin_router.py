import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.mark.asyncio
async def test_admin_endpoints_unauthorized_without_token():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/admin/dashboard/stats")
        assert response.status_code == 401

        books_resp = await client.get("/api/admin/books")
        assert books_resp.status_code == 401

        authors_resp = await client.get("/api/admin/authors")
        assert authors_resp.status_code == 401
