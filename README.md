# Apple Notifier MCP Server

An MCP (Model Context Protocol) server that enables sending native macOS notifications. This server integrates with any MCP-compatible client, making it easy to send system notifications from tools like Claude Desktop or Cline.

## Features

- Send native macOS notifications using `osascript`
- Customizable notifications with:
  - Title (required)
  - Message (required)
  - Subtitle (optional)
  - Sound control (optional)
- Full TypeScript support
- Comprehensive error handling
- Special character support (including apostrophes)

## Prerequisites

- macOS (for native notifications)
- Node.js >= 18
- An MCP-compatible client (e.g., Claude Desktop, Cline)

## Installation

1. Install the package:
```bash
npm install apple-notifier-mcp
```

2. Add to your MCP configuration file:

For Cline (`cline_mcp_settings.json`):
```json
{
  "mcpServers": {
    "apple-notifier": {
      "command": "node",
      "args": ["/path/to/node_modules/apple-notifier-mcp/build/index.js"]
    }
  }
}
```

For Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "apple-notifier": {
      "command": "node",
      "args": ["/path/to/node_modules/apple-notifier-mcp/build/index.js"]
    }
  }
}
```

## Usage

The server provides a single tool called `send_notification` that can be used through any MCP client:

```typescript
// Basic notification
await mcp.use_tool('apple-notifier', 'send_notification', {
  title: "Hello",
  message: "This is a notification"
});

// Full featured notification
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

### Error Handling

The server handles various error scenarios:
- Invalid parameters
- Command execution failures
- Permission issues
- System errors

Each error is properly mapped to appropriate MCP error codes and includes descriptive messages.

## Development

1. Clone the repository:
```bash
git clone https://github.com/turlockmike/apple-notifier-mcp.git
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

4. Start in development mode:
```bash
npm run dev
```

### Available Scripts

- `npm run build` - Build the project
- `npm run start` - Start the MCP server
- `npm run dev` - Start in watch mode for development
- `npm run clean` - Remove build artifacts
- `npm test` - Run tests (to be implemented)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Write clear, descriptive commit messages
- Add tests for new features (when we implement testing)
- Update documentation as needed
- Follow the existing code style

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with the [Model Context Protocol (MCP) SDK](https://github.com/anthropics/model-context-protocol)
- Inspired by the need for native notifications in Claude Desktop and Cline

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/turlockmike/apple-notifier-mcp/issues) page
2. Open a new issue if your problem hasn't been reported
3. Provide as much detail as possible, including:
   - Node.js version
   - macOS version
   - Steps to reproduce
   - Expected vs actual behavior
