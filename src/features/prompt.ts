import { PromptParams, PromptResult, NotificationError, NotificationErrorType } from '../types.js';
import { execAsync, escapeString } from '../utils/command.js';

/**
 * Validates prompt parameters
 */
function validatePromptParams(params: PromptParams): void {
  if (!params.message || typeof params.message !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Message is required and must be a string'
    );
  }

  if (params.defaultAnswer && typeof params.defaultAnswer !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Default answer must be a string'
    );
  }

  if (params.buttons) {
    if (!Array.isArray(params.buttons) || !params.buttons.every(b => typeof b === 'string')) {
      throw new NotificationError(
        NotificationErrorType.INVALID_PARAMS,
        'Buttons must be an array of strings'
      );
    }
    if (params.buttons.length > 3) {
      throw new NotificationError(
        NotificationErrorType.INVALID_PARAMS,
        'Maximum of 3 buttons allowed'
      );
    }
  }

  if (params.icon && !['note', 'stop', 'caution'].includes(params.icon)) {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Icon must be one of: note, stop, caution'
    );
  }
}

/**
 * Builds the AppleScript command for displaying a prompt
 */
function buildPromptCommand(params: PromptParams): string {
  let script = 'display dialog';
  
  script += ` "${escapeString(params.message)}"`;
  
  if (params.defaultAnswer !== undefined) {
    script += ` default answer "${escapeString(params.defaultAnswer)}"`;
  }
  
  if (params.buttons && params.buttons.length > 0) {
    script += ` buttons {${params.buttons.map(b => `"${escapeString(b)}"`).join(', ')}}`;
    script += ` default button ${params.buttons.length}`;
  } else {
    script += ' buttons {"Cancel", "OK"} default button 2';
  }
  
  if (params.icon) {
    script += ` with icon ${params.icon}`;
  }
  
  return `osascript -e '${script}'`;
}

/**
 * Prompts the user for input using osascript
 */
export async function promptUser(params: PromptParams): Promise<PromptResult> {
  try {
    validatePromptParams(params);
    const command = buildPromptCommand(params);
    const { stdout } = await execAsync(command);
    
    // Parse the AppleScript result
    // Format: button returned:OK, text returned:user input
    const match = stdout.match(/button returned:([^,]+)(?:, text returned:(.+))?/);
    if (!match) {
      throw new Error('Failed to parse dialog result');
    }
    
    const buttonText = match[1];
    const text = match[2];
    
    // Find the index of the clicked button
    const buttons = params.buttons || ['Cancel', 'OK'];
    const buttonIndex = buttons.findIndex(b => b === buttonText);
    
    return {
      text: text,
      buttonIndex: buttonIndex !== -1 ? buttonIndex : 0
    };
  } catch (error) {
    if (error instanceof NotificationError) {
      throw error;
    }

    const err = error as Error;
    if (err.message.includes('User canceled')) {
      throw new NotificationError(
        NotificationErrorType.PROMPT_CANCELLED,
        'User cancelled the prompt'
      );
    } else if (err.message.includes('execution error')) {
      throw new NotificationError(
        NotificationErrorType.COMMAND_FAILED,
        'Failed to execute prompt command'
      );
    } else if (err.message.includes('permission')) {
      throw new NotificationError(
        NotificationErrorType.PERMISSION_DENIED,
        'Permission denied when trying to show prompt'
      );
    } else {
      throw new NotificationError(
        NotificationErrorType.UNKNOWN,
        `Unexpected error: ${err.message}`
      );
    }
  }
}
