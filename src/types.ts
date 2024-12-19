/**
 * Parameters for sending a notification
 */
export interface NotificationParams {
  /** Title of the notification */
  title: string;
  /** Main message content */
  message: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Whether to play the default notification sound */
  sound?: boolean;
}

/**
 * Error types that can occur during notification operations
 */
export enum NotificationErrorType {
  INVALID_PARAMS = 'INVALID_PARAMS',
  COMMAND_FAILED = 'COMMAND_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PROMPT_CANCELLED = 'PROMPT_CANCELLED',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Parameters for prompting user input
 */
export interface PromptParams {
  /** Text to display in the prompt dialog */
  message: string;
  /** Optional default text to pre-fill */
  defaultAnswer?: string;
  /** Optional custom button labels */
  buttons?: string[];
  /** Optional icon name to display (note, stop, caution) */
  icon?: 'note' | 'stop' | 'caution';
}

/**
 * Response from a prompt dialog
 */
export interface PromptResult {
  /** Text entered by the user, or undefined if cancelled */
  text?: string;
  /** Index of the button clicked (0-based) */
  buttonIndex: number;
}

/**
 * Parameters for text-to-speech
 */
export interface SpeechParams {
  /** Text to speak */
  text: string;
  /** Voice to use (defaults to system voice) */
  voice?: string;
  /** Speech rate (-50 to 50, defaults to 0) */
  rate?: number;
}

/**
 * Parameters for taking a screenshot
 */
export interface ScreenshotParams {
  /** Path where to save the screenshot */
  path: string;
  /** Type of screenshot to take */
  type: 'fullscreen' | 'window' | 'selection';
  /** Image format (png, jpg, pdf, tiff) */
  format?: 'png' | 'jpg' | 'pdf' | 'tiff';
  /** Whether to hide the cursor */
  hideCursor?: boolean;
  /** Whether to include the window shadow (only for window type) */
  shadow?: boolean;
  /** Timestamp to add to filename (defaults to current time) */
  timestamp?: boolean;
}

/**
 * Custom error class for notification operations
 */
/**
 * Parameters for file selection
 */
export interface FileSelectParams {
  /** Optional prompt message */
  prompt?: string;
  /** Optional default location */
  defaultLocation?: string;
  /** Optional file type filter (e.g., {"public.image": ["png", "jpg"]}) */
  fileTypes?: Record<string, string[]>;
  /** Whether to allow multiple selection */
  multiple?: boolean;
}

/**
 * Result from file selection
 */
export interface FileSelectResult {
  /** Selected file paths */
  paths: string[];
}

export class NotificationError extends Error {
  constructor(
    public type: NotificationErrorType,
    message: string
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}
