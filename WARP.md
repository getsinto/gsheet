# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Framework: Next.js (App Router) with React + TypeScript
- Styling: Tailwind CSS v4 (with tw-animate-css), shadcn/ui components
- Data/services: Supabase (Postgres) + Cloudinary
- State: Zustand; Server state libs present (TanStack Query) but not yet wired in the visible code
- Hosting target noted in README: Vercel

Commands you’ll commonly use
- Install deps
  - npm install
- Run dev server (http://localhost:3000)
  - npm run dev
- Build for production
  - npm run build
- Start production server (after build)
  - npm run start
- Lint entire repo
  - npm run lint
- Lint a single file or directory (example)
  - npm run lint -- src/app/page.tsx
- Type-check (project-wide)
  - npx tsc -p tsconfig.json --noEmit
- Tests
  - No test runner is configured in package.json at this time.

Environment configuration (from README)
Define the following in .env.local before running locally:
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- NEXT_PUBLIC_APP_URL (e.g., http://localhost:3000)

Big-picture architecture
- App entry (App Router)
  - src/app/layout.tsx sets global fonts (Geist), imports globals.css, and injects a shared <ToasterClient /> for notifications. It exports basic Metadata for the app.
  - src/app/page.tsx is the current home page; it’s a template-like landing with links and minimal UI.
- Styling and design system
  - Tailwind v4 drives styling. src/app/globals.css sets CSS variables, base layers, utilities, print styles, and imports tw-animate-css.
  - tailwind.config.ts extends a set of semantic colors prefixed with status-* (e.g., status-dispatched, status-loaded) which align with domain statuses.
  - shadcn/ui components live under src/components/ui (alert, card, dialog, etc.). Prefer reusing these primitives for consistent UI.
  - A global toast system uses react-hot-toast via components/shared/ToasterClient and is wired in layout.tsx.
- Domain model and state
  - src/types/index.ts defines core domain types: OrderStatus and entities like Driver and Order.
  - src/store/index.ts provides a small Zustand store (e.g., sidebarOpen). Use this for lightweight client state.
- Data/services layer
  - Supabase: src/lib/supabase/client.ts creates the client from NEXT_PUBLIC_* env vars; it warns at import time if vars are missing (no hard throw).
  - Cloudinary: src/lib/cloudinary/index.ts configures the v2 SDK with env vars; this is server-side only.
  - Utilities: src/lib/utils.ts exposes a cn helper (clsx + tailwind-merge) for class name composition.
- Project aliases
  - tsconfig.json maps @/* to src/* (import from "@/..." rather than relative paths).
  - components.json (shadcn) also declares aliases for components, utils, ui, lib, hooks pointing to corresponding subpaths under src/.
- Next.js configuration
  - next.config.ts enables reactCompiler: true.

Linting setup
- ESLint config (eslint.config.mjs) extends eslint-config-next (core web vitals + typescript). Default ignores include .next, out, build, and next-env.d.ts.

Notes carried forward from README
- shadcn/toast is not available in the v4 registry; the project uses react-hot-toast with a global <Toaster /> via components/shared/ToasterClient.
- Tailwind v4 configuration exposes semantic order status colors in tailwind.config.ts.
