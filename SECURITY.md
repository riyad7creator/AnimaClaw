# Security Policy — AnimaClaw

## Reporting Vulnerabilities

If you discover a security vulnerability in AnimaClaw, please report it responsibly:

**Email:** riyad@ketami.net
**Subject line:** `[SECURITY] AnimaClaw — Brief description`

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a fix timeline within 7 days.

**Do NOT** open a public GitHub issue for security vulnerabilities.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.7.x | Yes |
| 1.5.x | Security fixes only |
| < 1.5 | No |

---

## Security Considerations

### Gateway Token

The `OPENCLAW_GATEWAY_TOKEN` authenticates server-side gateway calls. Keep it secret:
- Store only in `.env` or Vercel environment variables
- Never expose via `NEXT_PUBLIC_*` prefixed variables
- Rotate periodically

### Supabase Row-Level Security

Client workspaces rely on Supabase RLS for data isolation:
- Each workspace's data is scoped by `workspace_id`
- The `SUPABASE_ANON_KEY` is safe to expose (RLS enforces access)
- The `SUPABASE_SERVICE_KEY` must NEVER be exposed to the browser

### Authentication

- Admin accounts are created at `/setup` on first run
- Session cookies use `SameSite=strict` and `Secure=true` in production
- API access requires `x-api-key` header (auto-generated if not set)
- Passwords are hashed; plain-text passwords are never stored

### Network Security

- `MC_ALLOWED_HOSTS` restricts which hostnames can access the dashboard
- Set `MC_ALLOW_ANY_HOST=true` only when behind a trusted reverse proxy
- HSTS can be enabled with `MC_ENABLE_HSTS=1`

### Content Security

- CSP headers are set per-request with nonces
- `X-Frame-Options: DENY` prevents clickjacking
- `X-Content-Type-Options: nosniff` prevents MIME sniffing

---

## Dependencies

AnimaClaw uses `pnpm audit` to check for known vulnerabilities. Run:

```bash
cd dashboard && pnpm audit
```

---

*Last updated: March 2026*
