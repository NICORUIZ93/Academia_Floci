CREATE TABLE shipment (
  shipment_id UUID PRIMARY KEY,
  public_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('created', 'assigned', 'out_for_delivery', 'delivered')),
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0)
);

CREATE TABLE processed_command (
  command_id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipment(shipment_id),
  result_json JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledger_entry (
  entry_id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL,
  account_code TEXT NOT NULL,
  debit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

-- La aplicación inserta todas las líneas de una transacción en una única
-- transacción SQL y verifica SUM(debit) = SUM(credit) antes del commit.
