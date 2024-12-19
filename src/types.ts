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
  UNKNOWN = 'UNKNOWN'
}

/**
 * Custom error class for notification operations
 */
export class NotificationError extends Error {
  constructor(
    public type: NotificationErrorType,
    message: string
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}
