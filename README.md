# stellar-routex

A multi-currency payment routing engine built on the [Stellar](https://stellar.org) network. Stellar RouteX enables seamless cross-border transfers by automatically converting assets via path payments, allowing users and businesses to send and receive funds in their preferred currencies with low fees and near-instant settlement.

---

## Features

- **Account creation** — generate funded testnet accounts via Friendbot
- **Balance lookup** — fetch all asset balances for any Stellar account
- **Standard payments** — send XLM or any Stellar asset directly
- **Path payments** — auto-convert between currencies in a single atomic transaction
- **Path discovery** — query available conversion routes before executing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Blockchain | Stellar SDK (`@stellar/stellar-sdk`) |
| Config | dotenv |

---

## Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```bash
git clone https://github.com/BaseByMoore/stellar-routex.git
cd stellar-routex
npm install
cp .env.example .env
```

Edit `.env` and set your `SECRET_KEY` (a Stellar secret key starting with `S`).

### Run (development)

```bash
npm run dev
```

### Build & run (production)

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `HORIZON_URL` | `https://horizon-testnet.stellar.org` | Horizon API endpoint |
| `SECRET_KEY` | — | Stellar secret key for signing transactions |
| `PORT` | `3000` | HTTP port |

---

## API Reference

### `POST /create-account`

Creates a new Stellar keypair and funds it via Friendbot (testnet only).

**Response**
```json
{
  "publicKey": "G...",
  "secretKey": "S..."
}
```

---

### `GET /balance/:publicKey`

Returns all asset balances for the given account.

**Example**
```
GET /balance/GABC...XYZ
```

**Response**
```json
{
  "balances": [
    { "asset_type": "native", "balance": "10000.0000000" }
  ]
}
```

---

### `POST /send-payment`

Sends a direct payment (XLM or any issued asset).

**Body**
```json
{
  "secretKey": "S...",
  "destination": "G...",
  "amount": "100",
  "assetCode": "XLM"
}
```

For non-native assets, also include `"assetIssuer": "G..."`.

**Response**
```json
{ "success": true, "hash": "<transaction hash>" }
```

---

### `POST /route-payment`

Executes a **path payment**: the sender pays in one asset and the receiver gets a different asset. Stellar's DEX automatically finds the conversion path.

**Body**
```json
{
  "secretKey": "S...",
  "destination": "G...",
  "sendAssetCode": "XLM",
  "destAssetCode": "USDC",
  "destAssetIssuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  "destAmount": "10",
  "sendMax": "200"
}
```

**Response**
```json
{ "success": true, "hash": "<transaction hash>" }
```

---

### `GET /paths`

Discovers available conversion paths before executing a route payment.

**Query params:** `source`, `destAsset`, `destIssuer` (optional), `destAmount`

**Example**
```
GET /paths?source=G...&destAsset=USDC&destIssuer=GA5Z...&destAmount=10
```

**Response**
```json
{
  "paths": [
    {
      "source_asset_type": "native",
      "source_amount": "150.0000000",
      "path": []
    }
  ]
}
```

---

## How Stellar Path Payments Work

A standard payment requires both parties to hold the same asset. Path payments remove this constraint:

1. The sender specifies a **source asset** (what they hold) and a **destination asset** (what the receiver wants).
2. Stellar's on-chain DEX searches for a sequence of offers that connects the two assets — this is the **payment path**.
3. The entire conversion happens atomically in a single transaction. Either the full conversion succeeds or nothing is debited.
4. `sendMax` protects the sender from slippage: if the required source amount exceeds `sendMax`, the transaction fails safely.

This makes stellar-routex ideal for cross-border remittances, multi-currency wallets, and any scenario where sender and receiver prefer different currencies.

---

## License

MIT
