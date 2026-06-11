import os
import uuid
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mollie.api.client import Client as MollieClient
from supabase import create_client

app = FastAPI(title="Verhuurcheck Payment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://verhuurcheck.jarvisops.online", "http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MOLLIE_API_KEY = os.getenv("MOLLIE_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

FRONTEND_BASE = "https://verhuurcheck.jarvisops.online"
WEBHOOK_URL = "https://api.floorplangen.jarvisops.online/payment/webhook"


def get_mollie() -> MollieClient:
    client = MollieClient()
    client.set_api_key(MOLLIE_API_KEY)
    return client


def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


class CreatePaymentRequest(BaseModel):
    postcode: str
    huisnummer: str
    email: str


@app.post("/payment/create")
async def create_payment(body: CreatePaymentRequest):
    rapport_token = str(uuid.uuid4())
    mollie = get_mollie()

    try:
        payment = mollie.payments.create({
            "amount": {"currency": "EUR", "value": "9.95"},
            "description": f"Verhuurcheck rapport {body.postcode} {body.huisnummer}",
            "redirectUrl": f"{FRONTEND_BASE}/rapport?token={rapport_token}",
            "webhookUrl": WEBHOOK_URL,
            "metadata": {
                "postcode": body.postcode,
                "huisnummer": body.huisnummer,
                "email": body.email,
                "rapport_token": rapport_token,
            },
        })
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Mollie fout: {str(e)}")

    supabase = get_supabase()
    supabase.table("verhuurcheck_payments").insert({
        "payment_id": payment.id,
        "postcode": body.postcode,
        "huisnummer": body.huisnummer,
        "email": body.email,
        "status": "pending",
        "rapport_token": rapport_token,
    }).execute()

    return {"checkout_url": payment.checkout_url, "payment_id": payment.id}


@app.post("/payment/webhook")
async def payment_webhook(request: Request):
    form = await request.form()
    payment_id = form.get("id")
    if not payment_id:
        return {"status": "ok"}

    mollie = get_mollie()
    try:
        payment = mollie.payments.get(str(payment_id))
    except Exception:
        return {"status": "ok"}

    if payment.is_paid():
        meta = payment.metadata or {}
        supabase = get_supabase()
        supabase.table("verhuurcheck_payments").update({"status": "paid"}).eq(
            "payment_id", payment.id
        ).execute()

        if not supabase.table("verhuurcheck_payments").select("payment_id").eq("payment_id", payment.id).execute().data:
            supabase.table("verhuurcheck_payments").insert({
                "payment_id": payment.id,
                "postcode": meta.get("postcode", ""),
                "huisnummer": meta.get("huisnummer", ""),
                "email": meta.get("email", ""),
                "status": "paid",
                "rapport_token": meta.get("rapport_token", str(uuid.uuid4())),
            }).execute()

    return {"status": "ok"}


@app.get("/payment/status")
async def payment_status(token: str):
    supabase = get_supabase()
    result = supabase.table("verhuurcheck_payments").select(
        "status, postcode, huisnummer"
    ).eq("rapport_token", token).single().execute()

    if not result.data:
        return {"paid": False, "postcode": None, "huisnummer": None}

    row = result.data
    return {
        "paid": row["status"] == "paid",
        "postcode": row["postcode"],
        "huisnummer": row["huisnummer"],
    }
