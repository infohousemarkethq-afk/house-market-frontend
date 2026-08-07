# CLAUDE.md — House Market (frontend)

React + TypeScript SPA for House Market, a multi-tenant SaaS for short-let /
serviced apartment management in Nigeria. Talks to `house-market-backend`.

Four roles share one app but effectively see three different products:
**Company Admin** (full company view), **Manager** (assigned units only, no
booking control, no legal/financial documents), **Owner** (own units, possibly
across several companies; sees their agreed rate — never the guest price).
**Super Admin** is a separate surface and does not read tenant business data.

---

## The API contract — read this before writing any request

**Base URL:** `VITE_API_URL=http://localhost:5000/api/v1` — note the `/v1`.
Every module mounts under it.

**Every successful response is wrapped:**

    { statusCode, status: "success", message, data }

So the payload is `response.data.data`, never `response.data`. Type it with
`ApiEnvelope<T>` from `src/api/api.types.ts`.

**Errors:**

    { statusCode, status: "error", message, code?, errors? }

`code` appears only where a client must branch (`EMAIL_NOT_VERIFIED`,
`ACCOUNT_DEACTIVATED`, `COMPANY_SUSPENDED` — all three answer 403, so never
branch on the status alone). `errors` appears on 400s only, keyed by field.
`getApiErrorMessage` already unpacks both.

**Auth is an httpOnly session cookie** (`hm.sid`). No tokens, no localStorage,
no Authorization header. `withCredentials: true` is what makes it work.
Session state comes from `GET /auth/me` via `useMe()` and nowhere else — never
a local "isLoggedIn" flag, which would outlive the logouts it should follow.

Three endpoints hand back a live session and seed that cache: `/auth/login`,
`/auth/verify-otp`, `/auth/invites/accept`. The last two matter — verifying an
OTP or accepting an invitation **signs you in**, so don't send those users to
the login screen afterwards.

**Roles from the API** are `COMPANY_ADMIN | MANAGER | OWNER | SUPER_ADMIN`.
The UI's `ViewRole` is lowercase and has only three values. Map through
`toViewRole` in `auth.utils.ts` — never inline.

**Money is integer kobo.** ₦45,000 is `4500000`. Divide only at render, via
`formatNaira.util.ts`.

**Dates** are ISO strings. Booking ranges are half-open: a checkout day is a
valid check-in day for the next guest.

Live endpoint list: `http://localhost:5000/api-docs`

---

## Folder structure — feature-based; match what already exists

    src/
      api/                  axiosInstance, queryClient, shared envelope types
      routes/               route guards (ProtectedRoute, PublicOnlyRoute)
      pages/                one per route; thin, composes feature components
      context/
      utils/                pure helpers only
      components/ui/        presentational primitives (Button, TextField…)
      components/layout/
      features/<name>/
        <name>.types.ts
        <name>.utils.ts
        schema/             zod schemas for forms
        hooks/              react-query hooks — ALL requests live here
        components/         feature views

---

## Engineering rules

1. **Keep it simple.** Smallest change that solves the problem. No premature
   abstractions, no extra layers or wrappers beyond what the task needs.
2. **Think before coding.** Read the relevant files and confirm the real data
   shape against `/api-docs` before writing. Guessing a field name costs more
   than checking one.
3. **Server state = React Query + Axios only.** Every request goes through a
   hook in `features/<name>/hooks/` that calls `src/api/axiosInstance.ts`. No
   `useEffect` + fetch in components.
4. **Components consume hooks and render.** No data fetching inside them.
5. **Validation mirrors the backend.** A form schema looser than the server's
   turns a helpful inline error into a generic 400. When writing a schema,
   open the matching `.schema.ts` in the backend and copy its bounds exactly.
6. **Feedback = toasts.** Never `alert()`, never a silent failure. Field-level
   validation stays inline next to the field.
7. **Fixtures are scaffolding.** Anything in a `*.fixtures.ts` is placeholder
   data for design. When the real endpoint is wired, delete the fixture —
   never leave both, or the UI quietly keeps rendering the fake one.
8. **Permissions are the server's job.** Hiding a button is UX, not access
   control. Never send a role, `companyId` or `ownerId` in a request body and
   expect it to mean anything.
