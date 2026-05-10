# Multi-Provider Support — Enhancement Plan

> Status: **Parked** — implement once the target AI tool is decided.

## Context

Pixel Agents is currently hard-wired to Claude Code. The CLI command (`claude`), the project directory path (`~/.claude/projects/`), and the JSONL parsing are all Claude-specific. This plan adds a provider abstraction so other AI CLIs can plug in with full agent status (typing/reading/waiting animations).

---

## Feasibility by Provider

| Provider | Transcript Format | Full Status? |
|---|---|---|
| **Claude Code** | `~/.claude/projects/<hash>/<session>.jsonl` | ✅ Works now |
| **OpenAI Codex CLI** | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` | ✅ Yes — JSONL, similar structure |
| **GitHub Copilot CLI** | `~/.copilot/session-state/<id>/events.jsonl` | ⚠️ Schema undocumented — hook-based fallback only |

---

## What Needs to Change

### Hard coupling points (all Claude-specific today)

| File | What's hardcoded |
|---|---|
| `src/agentManager.ts:65` | `claude --session-id ${sessionId}` |
| `src/agentManager.ts:15` | `~/.claude/projects/<hash>` path |
| `src/constants.ts` | `TERMINAL_NAME_PREFIX = 'Claude Code'` |
| `src/transcriptParser.ts` | `block.type === 'tool_use'`, `record.subtype === 'turn_duration'`, token field names |
| `src/PixelAgentsViewProvider.ts:108` | `message.type === 'openClaude'` |

---

## Phase 1 — Provider Abstraction Layer

**New file: `src/providerConfig.ts`**

```typescript
export interface SchemaAdapter {
  isToolStart(record: unknown): { toolId: string; toolName: string } | null;
  isToolEnd(record: unknown): { toolId: string } | null;
  isTurnEnd(record: unknown): boolean;
  isUserPrompt(record: unknown): boolean;
  extractUsage(record: unknown): { inputTokens: number; outputTokens: number } | null;
}

export interface ProviderConfig {
  id: string;
  label: string;
  cliCommand: string;           // e.g. "claude", "codex"
  sessionFlag: string;          // e.g. "--session-id", "--session"
  permissionFlag?: string;      // e.g. "--dangerously-skip-permissions"
  projectDirBase: string;       // e.g. "~/.claude/projects", "~/.codex/sessions"
  terminalPrefix: string;       // e.g. "Claude Code", "Codex"
  sessionDiscovery: 'hash' | 'date-folder';
  adapter: SchemaAdapter;
}
```

Export two built-in providers: `CLAUDE_PROVIDER` and `CODEX_PROVIDER`.

**`package.json` — add VS Code setting:**
```json
"pixelAgents.provider": {
  "type": "string",
  "enum": ["claude", "openai-codex"],
  "enumDescriptions": ["Claude Code (default)", "OpenAI Codex CLI"],
  "default": "claude"
}
```

**`src/extension.ts`** — read setting on activate, resolve `ProviderConfig`, inject into `AgentManager` and `TranscriptParser`.

---

## Phase 2 — Refactor Existing Code

**`src/agentManager.ts`**
- `launchNewTerminal()`: `${config.cliCommand} ${config.sessionFlag} ${id}`
- `getProjectDirPath()`: dispatch on `config.sessionDiscovery`
  - `'hash'`: current behavior
  - `'date-folder'`: scan `~/.codex/sessions/<YYYY>/<MM>/<DD>/` for newest `rollout-*.jsonl`
- Terminal prefix regex → `config.terminalPrefix`
- Permission dialog → hide if `config.permissionFlag` undefined

**`src/transcriptParser.ts`**
- Accept `SchemaAdapter` param in `processTranscriptLine()`
- Delegate all record classification to adapter
- Claude adapter = thin wrapper around existing logic (no behavior change)

---

## Phase 3 — OpenAI Codex Schema Adapter

Codex JSONL schema (from OpenAI docs):

```
Line 1: { "type": "session_meta", "id": "<uuid>", "cwd": "...", ... }
Turn end: { "type": "turn.completed", ... }
Tool call: { "type": "item.completed", "item": { "type": "tool_use_block" | "command_execution", "tool_name": "...", "id": "..." } }
Usage: { "type": "response", "usage": { "input_tokens": N, "output_tokens": N, "cached_input_tokens": N } }
```

Codex emits one event per tool (start+end combined), so `isToolEnd` always returns null and the caller fires Done immediately after Start.

**Session discovery for Codex (`date-folder` mode):**
After launching the terminal, poll `~/.codex/sessions/<today>/` for a new `rollout-*.jsonl` that appeared after launch time. Read line 1 (`session_meta`) to confirm `cwd` matches workspace.

---

## Phase 4 — GitHub Copilot (Hook-Based, Limited)

Copilot's `events.jsonl` schema is undocumented. Use the **hooks system** instead — it has a public JSON format (`PreToolUse` / `PostToolUse`).

User installs a hook script once:
```sh
#!/bin/bash
# ~/.config/gh/copilot/hooks/pre-tool-use.sh
cat - >> ~/.pixel-agents/copilot-events.jsonl
```

Pixel Agents watches `~/.pixel-agents/copilot-events.jsonl`. Adapter reads `type: "PreToolUse"` / `type: "PostToolUse"`. Gives tool-start/end animations but no token counts.

**Defer Phase 4** — only implement if Copilot ends up being the chosen tool.

---

## Files to Modify

| File | Change |
|---|---|
| `src/providerConfig.ts` | **NEW** — interface + CLAUDE_PROVIDER + CODEX_PROVIDER |
| `src/agentManager.ts` | CLI command, flags, project dir, terminal prefix → from config |
| `src/transcriptParser.ts` | Inject SchemaAdapter; delegate record classification |
| `src/constants.ts` | Move TERMINAL_NAME_PREFIX into provider config |
| `src/extension.ts` | Read setting, resolve config, pass through |
| `package.json` | Add `pixelAgents.provider` setting contribution |

---

## Verification Steps (when implementing)

1. `npm run build` — no TypeScript errors
2. Claude regression: `+ Agent` → Claude terminal → animations work as before
3. Codex: switch setting to `openai-codex` → `+ Agent` → `codex` terminal → run a task → tool animations play
4. Settings switch: change `pixelAgents.provider` → reload window → correct provider used
