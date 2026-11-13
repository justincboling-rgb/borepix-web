# Database row-level security and RBAC standard

`borepix-web` has **no database yet**; orders, keys, pledges, affiliates and study progress live in the
visitor's browser. This document is the binding design for the first database (Postgres on Supabase,
Neon or Vercel Postgres is assumed; the rules hold for any store).

## Principles

1. **Default deny.** Every table has row-level security enabled and no policy until one is written.
   The application connects as a role that owns nothing and can only act through policies.
2. **Scope by owner.** Every user-owned table carries `user_id uuid not null references users(id)`.
   Policies compare `user_id` to the authenticated principal (`auth.uid()` on Supabase, the session's
   user id passed as a parameter elsewhere). No policy uses a value supplied in the request body.
3. **Least privilege.** The web app's database role gets `select/insert/update` only on the tables it
   needs; `delete` only where the product offers deletion; never `truncate`, DDL or superuser.
4. **Service role stays on the server.** Keys that bypass RLS (`SUPABASE_SERVICE_ROLE_KEY`,
   `DATABASE_URL`) exist only in server-side environment variables (see `env.md`) and are used only by
   webhooks and admin jobs, never by request handlers acting for a user.
5. **Storage buckets** follow the same model: private by default, object paths prefixed with the
   owner's id, signed URLs with short expiry for reads.

## Roles

| Role | Who | Grants |
|---|---|---|
| `anon` | unauthenticated visitor | read public catalogue tables only (`products`, `workbooks`) |
| `authenticated` | signed-in technologist | own rows in `profiles`, `orders`, `license_keys`, `submissions`, `pledges`, `affiliate_profiles` |
| `founder` | Borepix staff, set server-side on the session | read all orders, keys, pledges and affiliates; write payouts; never via the browser without the admin session |
| `service` | webhooks and jobs | bypasses RLS; server only |

Role membership is stored on the server (`users.role`) and read from the session, never from a client
claim (check 34).

## Policy templates

```sql
alter table orders enable row level security;

create policy "orders are visible to their owner"
  on orders for select
  using (user_id = auth.uid());

create policy "orders are created by webhooks only"
  on orders for insert
  with check (false);            -- the service role inserts; users never do

create policy "founders read every order"
  on orders for select
  using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'founder'));
```

Repeat for `license_keys` (owner read; redemption is an `update` of `redeemed_at` where
`user_id = auth.uid() and redeemed_at is null`), `submissions` (owner insert and read; grading is a
server job), `pledges` (owner insert and read), `affiliate_profiles` (owner read and update of
payout fields; `code` is immutable after creation) and `payouts` (founder only).

## Object-level checks in application code (IDOR / BOLA)

Even with RLS, every handler:

1. loads the record by id,
2. confirms `record.user_id === session.userId` (or the founder role),
3. only then acts.

A 404 is returned for records the user cannot see, so existence is not leaked (checks 06, 33).

## Review checklist for every migration

- RLS enabled on the new table before the first deploy.
- At least one `select` policy and explicit policies for each write the product allows.
- No policy references request data; only `auth.uid()`, the row and server-set roles.
- Service-role usage is limited to a named job or webhook and documented in `threat-model.md`.
