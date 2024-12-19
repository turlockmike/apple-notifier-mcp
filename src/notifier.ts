import { promisify } from 'util';
import { exec } from 'child_process';
import { NotificationParams, NotificationError, NotificationErrorType } from './types.js';

const execAsync = promisify(exec);

/**
 * Escapes special characters in strings for AppleScript
 */
function escapeString(str: string): string {
  // Escape for both AppleScript and shell
  return str
    .replace(/'/g, "'\\''")
    .replace(/"/g, '\\"');
}

/**
 * Validates notification parameters
 */
function validateParams(params: NotificationParams): void {
  if (!params.title || typeof params.title !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Title is required and must be a string'
    );
  }

  if (!params.message || typeof params.message !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Message is required and must be a string'
    );
  }

  if (params.subtitle && typeof params.subtitle !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Subtitle must be a string'
    );
  }

}

/**
 * Builds the AppleScript command for sending a notification
 */
function buildNotificationCommand(params: NotificationParams): string {
  const { title, message, subtitle, sound = true } = params;
  
  let script = `display notification "${escapeString(message)}" with title "${escapeString(title)}"`;
  
  if (subtitle) {
    script += ` subtitle "${escapeString(subtitle)}"`;
  }
  
  if (sound) {
    script += ` sound name "default"`;
  }

  
  return `osascript -e '${script}'`;
}

/**
 * Sends a notification using osascript
 */
export async function sendNotification(params: NotificationParams): Promise<void> {
  try {
    validateParams(params);
    const command = buildNotificationCommand(params);
    await execAsync(command);
  } catch (error) {
    if (error instanceof NotificationError) {
      throw error;
    }

    // Handle different types of system errors
    const err = error as Error;
    if (err.message.includes('execution error')) {
      throw new NotificationError(
        NotificationErrorType.COMMAND_FAILED,
        'Failed to execute notification command'
      );
    } else if (err.message.includes('permission')) {
      throw new NotificationError(
        NotificationErrorType.PERMISSION_DENIED,
        'Permission denied when trying to send notification'
      );
    } else {
      throw new NotificationError(
        NotificationErrorType.UNKNOWN,
        `Unexpected error: ${err.message}`
      );
    }
  }
}
