# Cursor instructions — Hero AI Shorts Factory V4

You are working on a production-oriented multi-tenant Next.js + Supabase + Node worker application.

Rules:
- Never expose service-role keys, OAuth client secrets, encryption keys, or OpenAI secrets in client code.
- Every user-owned table must use Supabase RLS with `auth.uid()` ownership. Do not use `user_metadata` for authorization.
- All user-facing job APIs must verify the signed-in user.
- Worker operations use the service role only from the trusted worker environment.
- Do not move FFmpeg/Remotion rendering into a normal request handler unless explicitly asked.
- Use deterministic Remotion input JSON; media generation belongs in adapters.
- Keep YouTube uploads private by default until the user explicitly chooses another privacy mode.
- Do not store raw YouTube refresh tokens; encrypt them at rest.
- Add tests for RLS, ownership, job claiming, and schedule execution before public launch.
- Pin dependencies and keep the lockfile committed.
