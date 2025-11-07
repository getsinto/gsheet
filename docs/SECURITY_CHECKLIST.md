# Security Checklist

- Environment variables not committed
- Supabase RLS policies enabled
- API routes require auth
- Validate uploads (type, size)
- Sanitize inputs to avoid XSS
- Consider CSRF mitigation for mutations
- Rate limiting (via edge/middleware or Vercel WAF)
- Secrets stored in Vercel env vars
- HTTPS enforced (Vercel)
- Security headers (Next + Vercel defaults)
- Regular dependency updates