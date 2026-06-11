CREATE TABLE verhuurcheck_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL,
  postcode TEXT NOT NULL,
  huisnummer TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'pending',
  rapport_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
