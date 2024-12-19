# Apple Notifier MCP Server

Send native macOS notifications through any MCP-compatible client like Claude Desktop or Cline.

<a href="https://glama.ai/mcp/servers/t1w1dq4wy4"><img width="380" height="200" src="https://glama.ai/mcp/servers/t1w1dq4wy4/badge" alt="apple-notifier-mcp MCP server" /></a>

## Prerequisites

- macOS
- Node.js >= 18
- An MCP-compatible client (Claude Desktop, Cline)

## Installation

1. Install the package globally:
```bash
npm install -g apple-notifier-mcp
```

2. Add to your MCP configuration file:

For Cline (`cline_mcp_settings.json`):
```json
{
  "mcpServers": {
    "apple-notifier": {
      "command": "apple-notifier-mcp"
    }
  }
}
```

For Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "apple-notifier": {
      "command": "apple-notifier-mcp"
    }
  }
}
```

### Parameters

- `title` (required): string - The title of the notification
- `message` (required): string - The main message content
- `subtitle` (optional): string - A subtitle to display
- `sound` (optional): boolean - Whether to play the default notification sound (default: true)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
