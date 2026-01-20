[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/turlockmike-apple-notifier-mcp-badge.png)](https://mseep.ai/app/turlockmike-apple-notifier-mcp)

# Apple Notifier MCP Server

[![smithery badge](https://smithery.ai/badge/apple-notifier-mcp)](https://smithery.ai/server/apple-notifier-mcp)
Send native macOS notifications and interact with system dialogs through any MCP-compatible client like Claude Desktop or Cline.

<a href="https://glama.ai/mcp/servers/t1w1dq4wy4"><img width="380" height="200" src="https://glama.ai/mcp/servers/t1w1dq4wy4/badge" alt="apple-notifier-mcp MCP server" /></a>

## Prerequisites

- macOS
- Node.js >= 18
- An MCP-compatible client (Claude Desktop, Cline)

## Installation

### Installing via Smithery

To install Apple Notifier for Claude Desktop automatically via [Smithery](https://smithery.ai/server/apple-notifier-mcp):

```bash
npx -y @smithery/cli install apple-notifier-mcp --client claude
```

### Manual Installation
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

## ⚠️ Important: First-Time Setup

**If notifications aren't showing up**, you need to grant notification permissions to Script Editor:

1. Open **Script Editor** (found in `/Applications/Utilities/Script Editor.app`)
2. Run this command in Script Editor:
   ```applescript
   display notification "Test notification" with title "Testing"
   ```
3. Click the **Run** button (▶️)
4. macOS will prompt you to allow Script Editor to send notifications - click **Allow**
5. Now try sending a notification from Claude Desktop again - it should work!

**Why is this needed?** When you use `osascript` to send notifications (which this MCP server does), macOS ties the notification permissions to Script Editor, not to the calling application (Claude Desktop or Terminal). This is a macOS design decision.

### Alternative: Do Not Disturb / Focus Mode

If notifications still don't appear after granting permissions:
- Make sure **Focus** (Do Not Disturb) is turned **OFF** in System Settings
- Check **System Settings > Notifications > Script Editor** and ensure notifications are enabled
- Verify that "Allow Notifications" is enabled (not just "Alerts")

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

## Troubleshooting

### Notifications Not Appearing

If the MCP server says the notification was sent successfully but you don't see it:

1. **Grant Script Editor Permissions (Most Common Issue)**
   - Open Script Editor (`/Applications/Utilities/Script Editor.app`)
   - Paste and run: `display notification "Test" with title "Test"`
   - Click "Allow" when macOS asks for notification permissions
   - This is required because `osascript` uses Script Editor's permissions

2. **Check Focus/Do Not Disturb Mode**
   - Disable Focus mode in the menu bar or System Settings
   - Notifications are suppressed when Focus is enabled

3. **Verify Notification Settings**
   - Go to **System Settings > Notifications > Script Editor**
   - Ensure "Allow Notifications" is enabled
   - Set notification style to "Banners" or "Alerts" (not "None")

4. **Test Manually**
   - Open Terminal and run:
     ```bash
     osascript -e 'display notification "Test message" with title "Test Title"'
     ```
   - If this doesn't show a notification, the issue is with system permissions, not the MCP server

### Understanding Notification Icons

When using `osascript`, notifications will appear with the **Script Editor** icon, not the Claude Desktop icon. This is a limitation of how macOS handles AppleScript notifications.

If you need notifications with a custom icon, consider using alternative tools like `terminal-notifier` (requires `brew install terminal-notifier`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.



## Running evals

The evals package loads an mcp client that then runs the index.ts file, so there is no need to rebuild between tests. You can load environment variables by prefixing the npx command. Full documentation can be found [here](https://www.mcpevals.io/docs).

```bash
OPENAI_API_KEY=your-key  npx mcp-eval src/evals/evals.ts src/index.ts
```
## License

MIT License - see the [LICENSE](LICENSE) file for details.
