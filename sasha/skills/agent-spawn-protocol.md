# SKILL: Agent Spawn Protocol
Version: 1.0
Created: 2026-06-25

---

## PURPOSE
Standardize how SASHA spawns sub-agents: mandate writing, parallel vs sequential decisions, output handling, and context handoff.

## TRIGGER
- Task requires research that would consume main context
- Multiple independent workstreams can run in parallel
- Specialized agent type is better suited to a subtask

## DEPENDENCIES
- Agent tool (available natively)
- SendMessage tool (for continuing agents)

## PRE-SPAWN CHECKLIST
Before spawning any agent:
1. Is there already a running agent doing this? Check before spawning.
2. Does this agent need output from another running agent? If yes — wait or run sequentially.
3. Can this be done inline in fewer than 3 tool calls? If yes — do it inline, don't spawn.
4. Write the mandate first — no mandate, no agent.

## MANDATE FORMAT (REQUIRED)
Every agent spawn must include:
```
AGENT TYPE: [R&D / Finance / Content / Operations / Growth / General]
OBJECTIVE: [1 sentence — what does this agent produce?]
CONTEXT: [Relevant background — what does it need to know?]
CONSTRAINTS: [What it must NOT do]
DELIVERABLE: [Exact output format and location]
DEADLINE: [Complete before X / Background — no deadline]
TOOLS AVAILABLE: [Which tools it should use]
```

## EXECUTION STEPS

### 1. Write mandate (inline, before spawning)
Document in /sasha/memory/decisions.md: agent spawned, mandate summary, expected output.

### 2. Spawn agent
```
Agent({
  description: "5-word task description",
  prompt: "[Full mandate text — self-contained, no references to this conversation]",
  run_in_background: true/false
})
```

### 3. Background vs foreground decision
- **Background** = agent output is NOT needed before SASHA's next action
- **Foreground** = SASHA must wait for agent output before proceeding
- Default to background when possible — maximize parallelism

### 4. Handle completion
When agent completes (notification received):
- Read agent output
- Write findings to appropriate /sasha/memory/ file
- Update decisions.md with outcome
- Update STATUS.md

### 5. Continue agent (if needed)
```
SendMessage({
  to: "[agent-id]",
  summary: "brief recap",
  message: "next instruction"
})
```

## OUTPUT HANDLING
Agent outputs must be written to files — never left only in conversation context.
Always save agent research to /sasha/memory/ before end of session.

## AGENT TYPE SELECTION
| Task Type | Agent Type |
|---|---|
| Code search, file finding | Explore |
| Architecture planning | Plan |
| Research, multi-step tasks | general-purpose |
| Anything else | claude (catch-all) |

## ERROR HANDLING
- Agent returns no output: re-spawn with more specific mandate
- Agent goes off-task: spawn new agent with tighter constraints
- Agent conflicts with another: document conflict in decisions.md, SASHA resolves or escalates to Josh

## NOTES
Sub-agents start cold — they have NO context from previous conversation. Every mandate must be fully self-contained.
