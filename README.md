# FlatDM

Setup commands for running the app locally.

## Install

```bash
npm install
```

## Environment Variables

Add these variables to `.env`:

| Variable | Purpose |
| --- | --- |
| `ENVIRONMENT` | Use `development` for `http://localhost:3000/` magic links or `production` for `https://flatdm.lewiscoding.com/` magic links |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `ORS_API_KEY` | Used for OpenRouteService |
| `NEXTAUTH_SECRET` | Secret used by NextAuth |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | `true` or `false` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender email address |

## Prisma

Make sure `.env` contains a valid `DATABASE_URL`, then sync the Prisma schema and generate the client:

```bash
npx prisma generate
```

## Run Dev

```bash
npm run dev
```

Open `http://localhost:3000`.
