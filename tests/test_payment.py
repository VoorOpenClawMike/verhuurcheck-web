import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# Patch Mollie and Supabase before importing the app
def make_mollie_payment(paid: bool = False, payment_id: str = "tr_test123"):
    p = MagicMock()
    p.id = payment_id
    p.checkout_url = "https://www.mollie.com/checkout/test"
    p.is_paid.return_value = paid
    p.metadata = {
        "postcode": "1234AB",
        "huisnummer": "10",
        "email": "test@example.com",
        "rapport_token": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    }
    return p


@pytest.fixture()
def client():
    mock_mollie_client = MagicMock()
    mock_mollie_client.payments.create.return_value = make_mollie_payment()
    mock_mollie_client.payments.get.return_value = make_mollie_payment(paid=True)

    mock_supabase = MagicMock()
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"id": "1"}])
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data={"status": "paid", "postcode": "1234AB", "huisnummer": "10"}
    )
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"payment_id": "tr_test123"}]
    )

    with (
        patch("api.payment.get_mollie", return_value=mock_mollie_client),
        patch("api.payment.get_supabase", return_value=mock_supabase),
    ):
        from api.payment import app
        yield TestClient(app)


def test_create_payment(client):
    resp = client.post(
        "/payment/create",
        json={"postcode": "1234AB", "huisnummer": "10", "email": "test@example.com"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "checkout_url" in data
    assert "payment_id" in data
    assert data["checkout_url"] == "https://www.mollie.com/checkout/test"
    assert data["payment_id"] == "tr_test123"


def test_create_payment_missing_fields(client):
    resp = client.post("/payment/create", json={"postcode": "1234AB"})
    assert resp.status_code == 422


def test_webhook_paid(client):
    resp = client.post(
        "/payment/webhook",
        data={"id": "tr_test123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_webhook_no_id(client):
    resp = client.post(
        "/payment/webhook",
        data={},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_status_paid(client):
    resp = client.get("/payment/status?token=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
    assert resp.status_code == 200
    data = resp.json()
    assert data["paid"] is True
    assert data["postcode"] == "1234AB"
    assert data["huisnummer"] == "10"


def test_status_not_found(client):
    mock_mollie_client = MagicMock()
    mock_supabase_nf = MagicMock()
    mock_supabase_nf.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data=None
    )
    with (
        patch("api.payment.get_mollie", return_value=mock_mollie_client),
        patch("api.payment.get_supabase", return_value=mock_supabase_nf),
    ):
        from api.payment import app
        from fastapi.testclient import TestClient as TC
        c2 = TC(app)
        resp = c2.get("/payment/status?token=nonexistent")
        assert resp.status_code == 200
        data = resp.json()
        assert data["paid"] is False
