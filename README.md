# Apple Notifier MCP Server

An MCP server that provides tools to send notifications on macOS using osascript. This server integrates with the Model Context Protocol (MCP) to enable sending native macOS notifications from any MCP-compatible client.

## Features

- Send native macOS notifications with customizable:
  - Title
  - Message
  - Subtitle (optional)
  - Sound (optional)
- Full error handling and parameter validation
- TypeScript implementation for type safety

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/apple-notifier-mcp.git
cd apple-notifier-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

1. Start the server:
```bash
npm start
```

2. Add the server to your MCP configuration file (e.g., `cline_mcp_settings.json`):
```json
{
  "mcpServers": {
    "apple-notifier": {
      "command": "node",
      "args": ["/path/to/apple-notifier-mcp/build/index.js"]
    }
  }
}
```

3. Use the server's tool through any MCP client:
```typescript
// Example usage in an MCP client
const result = await mcp.use_tool('apple-notifier', 'send_notification', {
  title: 'Hello',
  message: 'This is a test notification',
  subtitle: 'Optional subtitle',
  sound: true
});
```

## Tool: send_notification

Sends a native macOS notification.

### Parameters

- `title` (required): string - The title of the notification
- `message` (required): string - The main message content
- `subtitle` (optional): string - A subtitle to display
- `sound` (optional): boolean - Whether to play the default notification sound (default: true)

### Example

```typescript
await mcp.use_tool('apple-notifier', 'send_notification', {
  title: 'Meeting Reminder',
  message: 'Team standup in 5 minutes',
  subtitle: 'Daily Standup',
  sound: true
});
```

## Development

- Run in watch mode:
```bash
npm run dev
```

## Requirements

- macOS (for native notifications)
- Node.js >= 18
- TypeScript >= 5.0

## Error Handling

The server handles various error scenarios:

- Invalid parameters
- Command execution failures
- Permission issues
- System errors

Each error is properly mapped to appropriate MCP error codes and includes descriptive messages.

## License

ISC
