import { FileSelectParams, FileSelectResult, NotificationError, NotificationErrorType } from '../types.js';
import { execAsync, escapeString } from '../utils/command.js';

/**
 * Validates file selection parameters
 */
function validateFileSelectParams(params: FileSelectParams): void {
  if (params.prompt && typeof params.prompt !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Prompt must be a string'
    );
  }

  if (params.defaultLocation && typeof params.defaultLocation !== 'string') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Default location must be a string'
    );
  }

  if (params.multiple !== undefined && typeof params.multiple !== 'boolean') {
    throw new NotificationError(
      NotificationErrorType.INVALID_PARAMS,
      'Multiple selection flag must be a boolean'
    );
  }

  if (params.fileTypes) {
    if (typeof params.fileTypes !== 'object' || params.fileTypes === null) {
      throw new NotificationError(
        NotificationErrorType.INVALID_PARAMS,
        'File types must be an object'
      );
    }

    for (const [_, extensions] of Object.entries(params.fileTypes)) {
      if (!Array.isArray(extensions) || !extensions.every(ext => typeof ext === 'string')) {
        throw new NotificationError(
          NotificationErrorType.INVALID_PARAMS,
          'File type extensions must be an array of strings'
        );
      }
    }
  }
}

/**
 * Builds the AppleScript command for file selection
 */
function buildFileSelectCommand(params: FileSelectParams): string {
  let script = 'choose file';
  
  if (params.multiple) {
    script += ' with multiple selections allowed';
  }
  
  if (params.prompt) {
    script += ` with prompt "${escapeString(params.prompt)}"`;
  }
  
  if (params.defaultLocation) {
    script += ` default location "${escapeString(params.defaultLocation)}"`;
  }
  
  // Handle file type filtering if specified
  if (params.fileTypes) {
    const extensions = Object.values(params.fileTypes).flat();
    if (extensions.length > 0) {
      script += ` of type {${extensions.map(ext => `"${ext}"`).join(', ')}}`;
    }
  }
  
  return `osascript -e '${script}'`;
}

/**
 * Prompts user to select file(s) using native macOS file picker
 */
export async function selectFile(params: FileSelectParams): Promise<FileSelectResult> {
  try {
    validateFileSelectParams(params);
    const command = buildFileSelectCommand(params);
    const { stdout } = await execAsync(command);
    
    // Parse the AppleScript result
    // Format: alias "path1", alias "path2", ...
    const paths = stdout
      .trim()
      .split(', ')
      .map(path => path.replace(/^alias "|"$/g, ''))
      .map(path => path.replace(/:/g, '/'))
      .map(path => `/${path}`); // Add leading slash
    
    return { paths };
  } catch (error) {
    if (error instanceof NotificationError) {
      throw error;
    }

    const err = error as Error;
    if (err.message.includes('User canceled')) {
      throw new NotificationError(
        NotificationErrorType.PROMPT_CANCELLED,
        'File selection was cancelled'
      );
    } else if (err.message.includes('execution error')) {
      throw new NotificationError(
        NotificationErrorType.COMMAND_FAILED,
        'Failed to execute file selection command'
      );
    } else if (err.message.includes('permission')) {
      throw new NotificationError(
        NotificationErrorType.PERMISSION_DENIED,
        'Permission denied when trying to select file'
      );
    } else {
      throw new NotificationError(
        NotificationErrorType.UNKNOWN,
        `Unexpected error: ${err.message}`
      );
    }
  }
}
