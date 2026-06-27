# SKILL: Supabase Data Layer
Version: 1.0
Created: 2026-06-25

---

## PURPOSE
Design, build, and query the business data layer using Supabase. Covers schema design, migrations, SQL queries, and edge function deployment.

## TRIGGER
- New product/service requires data persistence
- Analytics or reporting needed
- API endpoint needed for customer-facing product
- CRM, billing, or order data needs to be stored

## DEPENDENCIES
- Supabase MCP (mcp__e632a3d1__*)
- Active Supabase project

## EXECUTION STEPS

### 1. Assess existing schema
```
mcp__e632a3d1__list_tables — see what exists
mcp__e632a3d1__list_migrations — check migration history
```

### 2. Design schema
Write schema in SQL before applying. Store schema designs in /sasha/memory/schemas/.
Conventions:
- All tables: id (uuid, default gen_random_uuid()), created_at (timestamptz, default now()), updated_at (timestamptz)
- Use snake_case for all names
- Add RLS policies for any customer-facing table

### 3. Apply migration
```
mcp__e632a3d1__apply_migration
- name: descriptive_snake_case_name
- query: SQL DDL statement
```

### 4. Verify
```
mcp__e632a3d1__execute_sql — run a SELECT to confirm structure
mcp__e632a3d1__list_tables — confirm table appears
```

### 5. Deploy edge function (if API needed)
```
mcp__e632a3d1__deploy_edge_function
- name: function-name
- entrypointPath: index.ts
- files: [{name, content}]
```

### 6. Get connection details for Make.com
```
mcp__e632a3d1__get_project_url — for Supabase REST API URL
mcp__e632a3d1__get_publishable_keys — for anon key
```

## STANDARD SCHEMAS

### customers table
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### transactions table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### leads table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ERROR HANDLING
- Migration fail: check SQL syntax, inspect error message
- RLS blocking: check policies with execute_sql on pg_policies
- Edge function deploy fail: check TypeScript syntax and Deno compatibility

## NOTES
Supabase provides instant REST API for every table. Use this to connect Make.com to data without building custom endpoints.
