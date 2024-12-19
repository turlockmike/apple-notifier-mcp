#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { sendNotification } from './features/notification.js';
import { promptUser } from './features/prompt.js';
import { speak } from './features/speech.js';
import { takeScreenshot } from './features/screenshot.js';
import { selectFile } from './features/fileSelect.js';
import { 
  NotificationError, 
  NotificationErrorType, 
  NotificationParams, 
  PromptParams, 
  PromptResult, 
  SpeechParams, 
  ScreenshotParams,
  FileSelectParams,
  FileSelectResult 
} from './types.js';

class AppleNotifierServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'apple-notifier',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'send_notification',
          description: 'Send a notification on macOS using osascript',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the notification',
              },
              message: {
                type: 'string',
                description: 'Main message content',
              },
              subtitle: {
                type: 'string',
                description: 'Optional subtitle',
              },
              sound: {
                type: 'boolean',
                description: 'Whether to play the default notification sound',
                default: true,
              },
            },
            required: ['title', 'message'],
            additionalProperties: false,
          },
        },
        {
          name: 'prompt_user',
          description: 'Display a dialog prompt to get user input',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Text to display in the prompt dialog',
              },
              defaultAnswer: {
                type: 'string',
                description: 'Optional default text to pre-fill',
              },
              buttons: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Optional custom button labels (max 3)',
                maxItems: 3
              },
              icon: {
                type: 'string',
                enum: ['note', 'stop', 'caution'],
                description: 'Optional icon to display'
              }
            },
            required: ['message'],
            additionalProperties: false,
          },
        },
        {
          name: 'speak',
          description: 'Speak text using macOS text-to-speech',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Text to speak',
              },
              voice: {
                type: 'string',
                description: 'Voice to use (defaults to system voice)',
              },
              rate: {
                type: 'number',
                description: 'Speech rate (-50 to 50, defaults to 0)',
                minimum: -50,
                maximum: 50
              }
            },
            required: ['text'],
            additionalProperties: false,
          },
        },
        {
          name: 'take_screenshot',
          description: 'Take a screenshot using macOS screencapture',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path where to save the screenshot',
              },
              type: {
                type: 'string',
                enum: ['fullscreen', 'window', 'selection'],
                description: 'Type of screenshot to take',
              },
              format: {
                type: 'string',
                enum: ['png', 'jpg', 'pdf', 'tiff'],
                description: 'Image format',
              },
              hideCursor: {
                type: 'boolean',
                description: 'Whether to hide the cursor',
              },
              shadow: {
                type: 'boolean',
                description: 'Whether to include the window shadow (only for window type)',
              },
              timestamp: {
                type: 'boolean',
                description: 'Timestamp to add to filename',
              }
            },
            required: ['path', 'type'],
            additionalProperties: false,
          },
        },
        {
          name: 'select_file',
          description: 'Open native file picker dialog',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Optional prompt message'
              },
              defaultLocation: {
                type: 'string',
                description: 'Optional default directory path'
              },
              fileTypes: {
                type: 'object',
                description: 'Optional file type filter (e.g., {"public.image": ["png", "jpg"]})',
                additionalProperties: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              },
              multiple: {
                type: 'boolean',
                description: 'Whether to allow multiple selection'
              }
            },
            additionalProperties: false
          }
        },
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!request.params.arguments || typeof request.params.arguments !== 'object') {
          throw new McpError(ErrorCode.InvalidParams, 'Invalid parameters');
        }

        switch (request.params.name) {
          case 'send_notification': {
            const { title, message, subtitle, sound } = request.params.arguments as Record<string, unknown>;
            
            if (typeof title !== 'string' || typeof message !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Title and message must be strings');
            }

            const params: NotificationParams = {
              title,
              message,
              subtitle: typeof subtitle === 'string' ? subtitle : undefined,
              sound: typeof sound === 'boolean' ? sound : undefined
            };

            await sendNotification(params);
            return {
              content: [
                {
                  type: 'text',
                  text: 'Notification sent successfully',
                },
              ],
            };
          }

          case 'prompt_user': {
            const { message, defaultAnswer, buttons, icon } = request.params.arguments as Record<string, unknown>;
            
            const params: PromptParams = {
              message: message as string,
              defaultAnswer: typeof defaultAnswer === 'string' ? defaultAnswer : undefined,
              buttons: Array.isArray(buttons) ? buttons as string[] : undefined,
              icon: ['note', 'stop', 'caution'].includes(icon as string) ? icon as 'note' | 'stop' | 'caution' : undefined
            };

            const result = await promptUser(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case 'speak': {
            const { text, voice, rate } = request.params.arguments as Record<string, unknown>;
            
            const params: SpeechParams = {
              text: text as string,
              voice: typeof voice === 'string' ? voice : undefined,
              rate: typeof rate === 'number' ? rate : undefined
            };

            await speak(params);
            return {
              content: [
                {
                  type: 'text',
                  text: 'Speech completed successfully',
                },
              ],
            };
          }

          case 'take_screenshot': {
            const { path, type, format, hideCursor, shadow, timestamp } = request.params.arguments as Record<string, unknown>;
            
            const params: ScreenshotParams = {
              path: path as string,
              type: type as 'fullscreen' | 'window' | 'selection',
              format: format as 'png' | 'jpg' | 'pdf' | 'tiff' | undefined,
              hideCursor: typeof hideCursor === 'boolean' ? hideCursor : undefined,
              shadow: typeof shadow === 'boolean' ? shadow : undefined,
              timestamp: typeof timestamp === 'boolean' ? timestamp : undefined
            };

            await takeScreenshot(params);
            return {
              content: [
                {
                  type: 'text',
                  text: 'Screenshot saved successfully',
                },
              ],
            };
          }

          case 'select_file': {
            const { prompt, defaultLocation, fileTypes, multiple } = request.params.arguments as Record<string, unknown>;
            
            const params: FileSelectParams = {
              prompt: typeof prompt === 'string' ? prompt : undefined,
              defaultLocation: typeof defaultLocation === 'string' ? defaultLocation : undefined,
              fileTypes: typeof fileTypes === 'object' && fileTypes !== null ? fileTypes as Record<string, string[]> : undefined,
              multiple: typeof multiple === 'boolean' ? multiple : undefined
            };

            const result = await selectFile(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof NotificationError) {
          let errorCode: ErrorCode;
          switch (error.type) {
            case NotificationErrorType.INVALID_PARAMS:
              errorCode = ErrorCode.InvalidParams;
              break;
            default:
              errorCode = ErrorCode.InternalError;
          }
          throw new McpError(errorCode, error.message);
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Apple Notifier MCP server running on stdio');
  }
}

const server = new AppleNotifierServer();
server.run().catch(console.error);
