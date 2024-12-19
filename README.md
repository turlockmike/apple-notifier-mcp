# Apple Notifier MCP Server

Send native macOS notifications through any MCP-compatible client like Claude Desktop or Cline.

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

## Usage

Send notifications with the `send_notification` tool:

```typescript
// Basic notification
await mcp.use_tool('apple-notifier', 'send_notification', {
  title: "Hello",
  message: "This is a notification"
});

// With all options
await mcp.use_tool('apple-notifier', 'send_notification', {
  title: "Meeting Reminder",
  message: "Team standup in 5 minutes",
  subtitle: "Daily Standup",
  sound: true
});
```

### Parameters

- `title` (required): string - The title of the notification
- `message` (required): string - The main message content
- `subtitle` (optional): string - A subtitle to display
- `sound` (optional): boolean - Whether to play the default notification sound (default: true)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

ISC License - see the [LICENSE](LICENSE) file for details.
