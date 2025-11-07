# Strong Containers Delivery Management System

A Next.js 14 (App Router) application for managing delivery operations for Strong Containers.

## Tech Stack
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS v4 + shadcn/ui components
- Supabase (PostgreSQL)
- Cloudinary (file storage)
- Vercel (hosting)
- React Hot Toast (notifications)
- Zustand (state)
- TanStack Query (server state)

## Setup
1. Prerequisites: Node 18+, npm
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local` (see `.env.example` for all vars):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SENTRY_DSN=
   ```

## Development
- Start dev server:
  ```bash
  npm run dev
  ```
- Build:
  ```bash
  npm run build
  ```
- Lint:
  ```bash
  npm run lint
  ```
- Type check:
  ```bash
  npm run type-check
  ```
- Tests:
  ```bash
  npm test
  ```
- Format code:
  ```bash
  npm run format
  ```

## Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── orders/
│   │   │   ├── drivers/
│   │   │   ├── schedule/
│   │   │   └── settings/
│   │   └── driver/
│   ├── api/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── drivers/
│   │   └── upload/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   ├── dashboard/
│   ├── orders/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── cloudinary/
│   ├── hooks/
│   ├── utils/
│   └── validations/
├── types/
│   └── index.ts
└── store/
    └── index.ts
```

## Deployment (Vercel)
1. Push code to GitHub
2. Import the repo in Vercel
3. Add environment variables from `.env.example` (Project Settings → Environment Variables)
4. Deploy. Build command: `npm run build`, Output dir: `.next`
5. Set `NEXT_PUBLIC_APP_URL` to your production domain

See `vercel.json` for CI configuration. Post-deploy, review docs in `docs/`.

## Notes
- shadcn/toast is not available in the v4 registry; we use `react-hot-toast` and include a global `<Toaster />` in `src/app/layout.tsx` via `components/shared/ToasterClient`.
- Tailwind v4 configuration is added in `tailwind.config.ts` to expose semantic order status colors.
