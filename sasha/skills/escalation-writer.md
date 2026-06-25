# SKILL: Escalation Writer
Version: 1.0
Created: 2026-06-25

---

## PURPOSE
Format and deliver escalations to Josh in the standard SASHA escalation format. Ensures Josh gets only what he needs, nothing more.

## TRIGGER
- Human credential required (payment processor, platform account, legal entity)
- Spend decision over $50
- Strategic pivot recommended
- Legal/compliance question
- Unresolvable agent conflict

## EXECUTION STEPS

### 1. Qualify the escalation
Before writing: confirm this CANNOT be resolved without Josh.
- Can SASHA get this credential another way? If yes — do it.
- Can SASHA work around this blocker for now? If yes — work around and flag as non-urgent.
- Is this truly a Josh-only action? Only then escalate.

### 2. Write to blockers.md first
Add entry to /sasha/memory/blockers.md with full context.

### 3. Format escalation
Use this exact format:

```
ESCALATION — [CATEGORY] — [DATE]

Situation: [2 sentences max.]

What SASHA has already done:
- [action 1]
- [action 2]
- [action 3]

What Josh needs to do: [ONE specific action.]

Deadline: [Specific date or "Before X can launch"]

Impact if delayed: [One sentence.]
```

### 4. Categories
- PAYMENT, ACCOUNT, LEGAL, SPEND, STRATEGY, CREDENTIAL

### 5. Keep it short
If the escalation is more than 10 lines, it's too long. Cut it.

## OUTPUT FORMAT
Escalation written to: /sasha/reports/escalation_[DATE]_[CATEGORY].md
Also surfaced in STATUS.md under PENDING JOSH ACTIONS

## NOTES
Josh should never receive a problem without SASHA having already done everything possible. The escalation is the last 5% SASHA cannot do alone.
