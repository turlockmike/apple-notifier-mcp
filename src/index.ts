#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { sendNotification } from './notifier.js';
import { NotificationError, NotificationErrorType, NotificationParams } from './types.js';

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
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'send_notification') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      try {
        if (!request.params.arguments || typeof request.params.arguments !== 'object') {
          throw new McpError(ErrorCode.InvalidParams, 'Invalid notification parameters');
        }

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
