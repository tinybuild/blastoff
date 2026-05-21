# Archive

Code paths retired during the 2026-05-21 PM pivot from extension-centric to MCP-centric.

## extension/

Chrome MV3 autofill extension. Shipped v0.1.0, wired DevHunt end-to-end (4/6 fields filled live), then retired same day after the unanimous four-operator call to ship as MCP server + skill plugin instead. The customer is the agent-fluent indie maker — building a Chrome extension for someone who already has Claude Code/Cursor/Codex open is the wrong front door.

Kept here for reference: rule format, three-strategy field matching, MutationObserver wait pattern, badge UX, RULES.md playbook — all carries over to the MCP version. The DOM-fill logic is what gets replaced; everything underneath (profile shape, directory recipes, variant voice specs) stays.

If you have it loaded unpacked in Chrome/Dia, unload it at `chrome://extensions` when convenient.
