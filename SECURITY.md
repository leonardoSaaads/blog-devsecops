# Security Policy

## Supported versions

Only the `main` branch — the version deployed to production — receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

1. Use GitHub's private reporting: **Security → Report a vulnerability** in this repository.
2. Alternatively, use the e-mail address listed on the blog's About page.

Include the affected URL or file, steps to reproduce and the impact you observed. You can expect an acknowledgement within 7 days and a fix or mitigation plan within 30 days for confirmed issues.

## Scope

- The static site and its HTTP headers (`_headers`, `_redirects`, CSP).
- The build pipeline and dependencies of this repository.

Third-party services (Cloudflare, GitHub, Giscus) are out of scope; report issues in those directly to their vendors.
