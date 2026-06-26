# SKILL: Netlify Deploy
Version: 1.0
Created: 2026-06-25

---

## PURPOSE
Deploy web applications, landing pages, and APIs to Netlify. Covers project setup, deployment, environment variables, and domain management.

## TRIGGER
- New customer-facing product needs a URL
- Landing page needed for income stream
- API/function needs public endpoint
- New version of existing product ready

## DEPENDENCIES
- Netlify MCP (mcp__af1ed1b5__*)
- GitHub repository (for CI/CD deployment)
- Source code ready in working directory

## EXECUTION STEPS

### 1. Check existing deployments
```
mcp__af1ed1b5__netlify-deploy-services-reader — list existing deploys
mcp__af1ed1b5__netlify-project-services-reader — list existing projects
```

### 2. Create/configure project
```
mcp__af1ed1b5__netlify-project-services-updater — create or update project
- Link to GitHub repo for automatic deploys on push
- Set build command and publish directory
```

### 3. Set environment variables
```
mcp__af1ed1b5__netlify-project-services-updater — add env vars
- SUPABASE_URL
- SUPABASE_ANON_KEY
- Any service API keys
```

### 4. Deploy
```
mcp__af1ed1b5__netlify-deploy-services-updater — trigger deploy
```

### 5. Verify
```
mcp__af1ed1b5__netlify-deploy-services-reader — check deploy status
```

## STANDARD PROJECT TYPES

### Static Landing Page
- Build command: (none, or: npm run build)
- Publish directory: / or /dist or /out

### Next.js App
- Build command: npm run build
- Publish directory: .next
- Runtime: @netlify/plugin-nextjs

### Serverless Functions
- Functions directory: netlify/functions/
- Runtime: Node.js 18+

## ERROR HANDLING
- Build fails: check build logs, verify dependencies in package.json
- Deploy fails: check env vars are set, verify GitHub connection
- 404 on deploy: check publish directory setting matches actual output

## NOTES
Every deploy gets a unique preview URL — use this for testing before directing traffic. Custom domain requires Josh to purchase and configure DNS.
