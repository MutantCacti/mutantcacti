# mutantcacti

Personal site + tools. Self-hosted on Hetzner.

## Structure

```
mutantcacti/
├── www/              # mutantcacti.com - static site
├── me/               # me.mutantcacti.com - org tools (deadlines, etc)
└── deploy/
    ├── nginx/        # virtual host configs
    └── systemd/      # service files
```

## Server

- **IP**: 46.225.3.13
- **Host**: Hetzner CX23 (Nuremberg)
- **OS**: Ubuntu 24.04

## Subdomains

| Subdomain | Purpose |
|-----------|---------|
| mutantcacti.com | Portfolio, journal, projects |
| me.mutantcacti.com | Personal organization (deadlines API + UI) |
| o.mutantcacti.com | Reserved for O |

## Deploy

```bash
ssh root@46.225.3.13
```
