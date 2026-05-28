# HAQMS Backend

Express.js API and Prisma data layer for MedFlow AI.

## Local Development

1. Copy `backend/.env.example` to `backend/.env`.
2. Point `DATABASE_URL` at PostgreSQL.
3. Set a strong `JWT_SECRET`.
4. Run migrations and seed data.

```bash
npm install
npm run db:setup
npm run dev
```

## Production Deployment on Railway

- Use `npm start` as the service command.
- Set `NODE_ENV=production`.
- Set `DATABASE_URL` to the Railway Postgres connection string.
- Set `JWT_SECRET` to a strong secret.
- Set `CORS_ORIGIN` to the Vercel frontend URL.
- Run `prisma migrate deploy` during startup or as a Railway release command.

## Prisma Commands

```bash
npm run prisma:generate
npm run prisma:deploy
npm run prisma:migrate
npm run prisma:seed
```

## API Notes

- `GET /api/patients/:id` returns patient details with appointments and doctor metadata.
- `GET /api/patients` supports search, gender filtering, and pagination.
- `GET /api/queue` powers the public queue board.
- `POST /api/queue/checkin` allocates queue tokens transactionally.
