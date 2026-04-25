# OtterBadges Technical Guidance

This project is a digital badge platform built with **Next.js 16 (App Router)** and **Material Design 3**.

## Core Mandates

- **UI Components**: ALWAYS use the React-wrapped Material Web components from `src/components/MaterialUI.tsx`. Do NOT import directly from `@material/web` in your application code; if a new component is needed, add it to `src/components/MaterialUI.tsx` first.
- **Theming**: The application uses dynamic Material 3 theming via `@material/material-color-utilities`. Theming is managed in `src/components/ThemeProvider.tsx`.
- **Database**: We use **Prisma** with **SQLite** (`better-sqlite3`). After any change to `prisma/schema.prisma`, you MUST run `npx prisma db push` and `npx prisma generate`.
- **Type Safety**: Maintain strict TypeScript adherence. Ensure all API responses and database interactions are properly typed.

## Project Structure & Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: Material Web (@material/web) via `@lit/react`
- **ORM**: Prisma
- **Database**: SQLite
- **Auth**: NextAuth.js (JWT Strategy)

### Key Directories
- `src/app/api`: All backend API endpoints.
- `src/app/admin`: Admin-only management pages.
- `src/app/u/[id]`: Dynamic user profile routes (supports both UUID and custom alias).
- `src/components`: Shared React components and Material UI wrappers.
- `src/lib`: Core utility libraries including `prisma.ts` and `auth.ts`.

## Implementation Patterns

### Material Design 3 Usage
When using Material components, follow the Material 3 design system principles.
```tsx
import { FilledButton, Icon } from "@/components/MaterialUI";

<FilledButton onClick={() => {}}>
  <Icon slot="icon">add</Icon>
  Create Badge
</FilledButton>
```

### Authentication & Authorization
- Use `getServerSession(authOptions)` in Server Components/API routes.
- The session object is augmented with `id`, `alias`, and `role`.
- Check `session.user.role === 'ADMIN'` for protected administrative actions.

### API Routes
Standardize API responses using the patterns found in `src/app/api`.
- Prefer `NextResponse.json()` for structured data.
- Ensure proper error handling and status codes (401 for Unauthorized, 403 for Forbidden, etc.).

## Development Workflow

1.  **Environment**: Ensure `.env` is configured with `DATABASE_URL`, `NEXTAUTH_SECRET`, and optionally Google OAuth credentials.
2.  **Schema Changes**:
    - Update `prisma/schema.prisma`.
    - Run `npx prisma db push`.
    - Run `npx prisma generate`.
3.  **Theming**: Colors are derived from `user.themeColor`. The global `MaterialThemeProvider` handles the CSS custom property injection for `@material/web` components.

## Conventions
- **Icons**: Use Google Material Symbols (available via the `Icon` component).
- **Styling**: Prefer CSS Modules (`*.module.css`) for component-specific styles that aren't handled by Material Design custom properties.
- **Naming**: Use camelCase for variables/functions and PascalCase for React components.
