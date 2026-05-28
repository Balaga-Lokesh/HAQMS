# MedFlow AI Frontend

Next.js App Router client for MedFlow AI.

## Local Development

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend API.
3. Install dependencies and run the dev server.

```bash
npm install
npm run dev
```

## Production Deployment on Vercel

- Set `NEXT_PUBLIC_API_BASE_URL` to the Railway backend URL ending in `/api`.
- Deploy as a standard Next.js App Router application.
- Confirm the backend `CORS_ORIGIN` includes the Vercel domain.

## Validation

```bash
npm run build
npm run lint
```

## Frontend Areas

- `src/app/page.js` - landing page
- `src/app/login/page.js` - auth entry point
- `src/app/dashboard/page.js` - role-based operations dashboard
- `src/app/queue/page.js` - public queue monitor
- `src/app/patients/[id]/history-records/page.js` - patient clinical record view
