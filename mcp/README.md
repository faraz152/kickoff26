# kickoff26 MCP server

A zero-dependency [Model Context Protocol](https://modelcontextprotocol.io) server over the open
World Cup 2026 dataset, so an AI assistant can answer things like *"when does Brazil play in my
timezone?"* or *"where can I watch the final for free in the UK?"* straight from the data.

It speaks MCP's stdio transport (newline-delimited JSON-RPC 2.0) directly — no SDK, no build step, no
network. Just Node 18+.

## Tools

| Tool | What it does |
|---|---|
| `list_matches` | Filter matches by team, group, stage, status, or UTC date; optional local time. |
| `team_schedule` | A team's full fixture list in UTC and a timezone you pass. |
| `where_to_watch` | Legal, **free-first** ways to watch in a country. Never lists pirate streams. |
| `group_standings` | Live-computed group table with the FIFA 2026 tiebreakers. |
| `next_matches` | The next upcoming matches from now (or any time). |

## Run

```bash
node mcp/server.mjs
```

It reads `../data` by default; set `KICKOFF_DATA_DIR` to point elsewhere.

## Wire it into a client

Claude Desktop (`claude_desktop_config.json`) or any MCP client:

```json
{
  "mcpServers": {
    "kickoff26": {
      "command": "node",
      "args": ["/absolute/path/to/kickoff26/mcp/server.mjs"]
    }
  }
}
```

Claude Code:

```bash
claude mcp add kickoff26 -- node /absolute/path/to/kickoff26/mcp/server.mjs
```

Then ask: *"Use kickoff26 — when does Morocco play, in Africa/Casablanca time, and where can I watch
free in Morocco?"*

## Notes

Read-only — it never mutates the dataset. Knockout fixtures show as placeholders (`Winner Group A`,
`Winner of Match 74`) until results fill the bracket, matching the site.
