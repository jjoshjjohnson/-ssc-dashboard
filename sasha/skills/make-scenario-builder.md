# SKILL: Make.com Scenario Builder
Version: 1.0
Created: 2026-06-25

---

## PURPOSE
Build, configure, and activate Make.com automation scenarios programmatically using the Make MCP tools.

## TRIGGER
- New income stream requires automation pipeline
- Existing manual process needs to be automated
- Webhook handler needed for inbound data

## DEPENDENCIES
- Make.com MCP (mcp__debeaf7b__*)
- Active Make.com team/organization

## EXECUTION STEPS

### 1. List existing scenarios (context)
```
mcp__debeaf7b__scenarios_list — check for conflicts or reusable patterns
```

### 2. Define scenario blueprint
Before building, write a blueprint with:
- Trigger module (webhook, schedule, watch)
- Data transformation steps
- Output/action modules
- Error handling

### 3. Create scenario
```
mcp__debeaf7b__scenarios_create
- name: descriptive kebab-case
- blueprint: JSON blueprint
- teamId: from mcp__debeaf7b__teams_list
```

### 4. Validate
```
mcp__debeaf7b__validate_blueprint_schema — validate before activating
```

### 5. Activate
```
mcp__debeaf7b__scenarios_activate — only after validation passes
```

### 6. Test
```
mcp__debeaf7b__scenarios_run — trigger a test run
mcp__debeaf7b__executions_list — verify execution completed
mcp__debeaf7b__executions_get-detail — inspect output
```

## OUTPUT FORMAT
- Scenario ID (save to decisions.md)
- Activation status
- Test execution result

## COMMON PATTERNS

### Webhook → Database pattern
Trigger: Custom webhook → Transform → Supabase insert

### Schedule → Email pattern
Trigger: Cron → Fetch data → Format → Gmail send

### Form → CRM pattern
Trigger: Webhook (form submission) → Validate → Supabase upsert → Gmail confirm

## ERROR HANDLING
- If scenario creation fails: check blueprint JSON validity
- If activation fails: check module connections are authorized
- If execution fails: use executions_get-detail to inspect error module

## NOTES
Make.com has 1000+ pre-built connectors. Always check if a native module exists before building custom HTTP calls.
