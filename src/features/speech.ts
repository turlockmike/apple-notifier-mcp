import { SpeechParams, NotificationError, NotificationErrorType } from '../types.js';
import { execAsync, escapeString } from '../utils/command.js';

/**
 * Validates speech parameters
 */
function validateSpeechParams(params: SpeechParams): void {
  if (!params.text || typeof params.text !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Text is required and must be a string'
    );
  }

  if (params.voice && typeof params.voice !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Voice must be a string'
    );
  }

  if (params.rate !== undefined) {
    if (typeof params.rate !== 'number') {
      throw new NotificationError(
        NotificationErrorType.INVALID_PARAMS,
        'Rate must be a number'
      );
    }
    if (params.rate < -50 || params.rate > 50) {
      throw new NotificationError(
        NotificationErrorType.INVALID_PARAMS,
        'Rate must be between -50 and 50'
      );
    }
  }
}

/**
 * Builds the say command for text-to-speech
 */
function buildSpeechCommand(params: SpeechParams): string {
  let command = 'say';
  
  if (params.voice) {
    command += ` -v "${escapeString(params.voice)}"`;
  }
  
  if (params.rate !== undefined) {
    command += ` -r ${params.rate}`;
  }
  
  command += ` "${escapeString(params.text)}"`;
  
  return command;
}

/**
 * Speaks text using macOS text-to-speech
 */
export async function speak(params: SpeechParams): Promise<void> {
  try {
    validateSpeechParams(params);
    const command = buildSpeechCommand(params);
    await execAsync(command);
  } catch (error) {
    if (error instanceof NotificationError) {
      throw error;
    }

    const err = error as Error;
    if (err.message.includes('execution error')) {
      throw new NotificationError(
        NotificationErrorType.COMMAND_FAILED,
        'Failed to execute speech command'
      );
    } else if (err.message.includes('permission')) {
      throw new NotificationError(
        NotificationErrorType.PERMISSION_DENIED,
        'Permission denied when trying to speak'
      );
    } else {
      throw new NotificationError(
        NotificationErrorType.UNKNOWN,
        `Unexpected error: ${err.message}`
      );
    }
  }
}
