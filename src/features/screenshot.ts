import { ScreenshotParams, NotificationError, NotificationErrorType } from '../types.js';
import { execAsync, escapeString } from '../utils/command.js';

/**
 * Validates screenshot parameters
 */
function validateScreenshotParams(params: ScreenshotParams): void {
  if (!params.path || typeof params.path !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Path is required and must be a string'
    );
  }

  if (!params.type || !['fullscreen', 'window', 'selection'].includes(params.type)) {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Type must be one of: fullscreen, window, selection'
    );
  }

  if (params.format && !['png', 'jpg', 'pdf', 'tiff'].includes(params.format)) {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Format must be one of: png, jpg, pdf, tiff'
    );
  }

  if (params.hideCursor !== undefined && typeof params.hideCursor !== 'boolean') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'HideCursor must be a boolean'
    );
  }

  if (params.shadow !== undefined && typeof params.shadow !== 'boolean') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Shadow must be a boolean'
    );
  }

  if (params.timestamp !== undefined && typeof params.timestamp !== 'boolean') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Timestamp must be a boolean'
    );
  }
}

/**
 * Builds the screencapture command
 */
function buildScreenshotCommand(params: ScreenshotParams): string {
  let command = 'screencapture';
  
  // Screenshot type
  switch (params.type) {
    case 'window':
      command += ' -w'; // Capture window
      break;
    case 'selection':
      command += ' -s'; // Interactive selection
      break;
    // fullscreen is default, no flag needed
  }
  
  // Optional flags
  if (params.format) {
    command += ` -t ${params.format}`;
  }
  
  if (params.hideCursor) {
    command += ' -C'; // Hide cursor
  }
  
  if (params.type === 'window' && params.shadow === false) {
    command += ' -o'; // No window shadow
  }
  
  // Add timestamp to filename if requested
  let path = params.path;
  if (params.timestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = params.format || 'png';
    path = path.replace(new RegExp(`\\.${ext}$`), `-${timestamp}.${ext}`);
  }
  
  command += ` "${escapeString(path)}"`;
  
  return command;
}

/**
 * Takes a screenshot using screencapture
 */
export async function takeScreenshot(params: ScreenshotParams): Promise<void> {
  try {
    validateScreenshotParams(params);
    const command = buildScreenshotCommand(params);
    await execAsync(command);
  } catch (error) {
    if (error instanceof NotificationError) {
      throw error;
    }

    const err = error as Error;
    if (err.message.includes('execution error')) {
      throw new NotificationError(
        NotificationErrorType.COMMAND_FAILED,
        'Failed to capture screenshot'
      );
    } else if (err.message.includes('permission')) {
      throw new NotificationError(
        NotificationErrorType.PERMISSION_DENIED,
        'Permission denied when trying to capture screenshot'
      );
    } else {
      throw new NotificationError(
        NotificationErrorType.UNKNOWN,
        `Unexpected error: ${err.message}`
      );
    }
  }
}
