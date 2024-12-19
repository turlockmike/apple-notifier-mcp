# Apple Notifier MCP Server

Send native macOS notifications and interact with system dialogs through any MCP-compatible client like Claude Desktop or Cline.

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

## Features

### Send Notifications

Display native macOS notifications with customizable content.

Parameters:
- `title` (required): string - The title of the notification
- `message` (required): string - The main message content
- `subtitle` (optional): string - A subtitle to display
- `sound` (optional): boolean - Whether to play the default notification sound (default: true)

### Display Prompts

Show interactive dialog prompts to get user input.

Parameters:
- `message` (required): string - Text to display in the prompt dialog
- `defaultAnswer` (optional): string - Default text to pre-fill
- `buttons` (optional): string[] - Custom button labels (max 3)
- `icon` (optional): 'note' | 'stop' | 'caution' - Icon to display

### Text-to-Speech

Use macOS text-to-speech capabilities.

Parameters:
- `text` (required): string - Text to speak
- `voice` (optional): string - Voice to use (defaults to system voice)
- `rate` (optional): number - Speech rate (-50 to 50, defaults to 0)

### Take Screenshots

Capture screenshots using macOS screencapture.

Parameters:
- `path` (required): string - Path where to save the screenshot
- `type` (required): 'fullscreen' | 'window' | 'selection' - Type of screenshot
- `format` (optional): 'png' | 'jpg' | 'pdf' | 'tiff' - Image format
- `hideCursor` (optional): boolean - Whether to hide the cursor
- `shadow` (optional): boolean - Whether to include window shadow (only for window type)
- `timestamp` (optional): boolean - Add timestamp to filename

### File Selection

Open native macOS file picker dialog.

Parameters:
- `prompt` (optional): string - Prompt message
- `defaultLocation` (optional): string - Default directory path
- `fileTypes` (optional): object - File type filter (e.g., {"public.image": ["png", "jpg"]})
- `multiple` (optional): boolean - Allow multiple file selection

## Example Usage

```typescript
// Send a notification
await client.use_mcp_tool("apple-notifier", "send_notification", {
  title: "Hello",
  message: "World",
  sound: true
});

// Show a prompt
const result = await client.use_mcp_tool("apple-notifier", "prompt_user", {
  message: "What's your name?",
  defaultAnswer: "John Doe",
  buttons: ["OK", "Cancel"]
});

// Speak text
await client.use_mcp_tool("apple-notifier", "speak", {
  text: "Hello, world!",
  voice: "Samantha",
  rate: -20
});

// Take a screenshot
await client.use_mcp_tool("apple-notifier", "take_screenshot", {
  path: "screenshot.png",
  type: "window",
  format: "png"
});

// Select files
const files = await client.use_mcp_tool("apple-notifier", "select_file", {
  prompt: "Select images",
  fileTypes: {
    "public.image": ["png", "jpg", "jpeg"]
  },
  multiple: true
});
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
