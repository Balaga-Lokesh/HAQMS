# HAQMS Frontend

Next.js App Router frontend for the Hospital Appointment & Queue Management System (HAQMS).

## Frontend Features

- Modern responsive healthcare dashboard UI
- Role-based interfaces for Admin, Doctor, and Receptionist
- Patient registration and management workflows
- Appointment scheduling interface
- Live queue monitoring and token updates
- Clinical history and patient record views
- Secure API integration using environment variables
- Optimized production deployment on Vercel

## Local Development

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your backend API.
3. Install dependencies and run the dev server.

```bash
npm install
npm run dev
```

## Live Application

https://frontend-haqms.vercel.app/

## Production Deployment on Vercel

- Set `NEXT_PUBLIC_API_BASE_URL` to the Railway backend URL ending in `/api`.
- Deploy as a standard Next.js App Router application.
- Confirm the backend `CORS_ORIGIN` includes the Vercel domain.

## Validation

```bash
npm run build
npm run lint
```

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS
- App Router Architecture
- Railway + Vercel Deployment

## Frontend Areas

- `src/app/page.js` - landing page
- `src/app/login/page.js` - auth entry point
- `src/app/dashboard/page.js` - centralized hospital operations dashboard
- `src/app/queue/page.js` - public queue monitor
- `src/app/patients/[id]/history-records/page.js` - patient clinical record view
