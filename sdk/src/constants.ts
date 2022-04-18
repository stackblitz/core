/**
 * Number of milliseconds between attempts to get a response from an embedded frame
 */
export const CONNECT_INTERVAL = 500;

/**
 * How many times should we try to get an init response from an embedded frame
 */
export const CONNECT_MAX_ATTEMPTS = 20;

/**
 * Default height attribute for iframes
 */
export const DEFAULT_FRAME_HEIGHT = 300;

/**
 * Origin of the StackBlitz instance
 */
export const DEFAULT_ORIGIN = 'https://stackblitz.com';

/**
 * List of supported template names.
 */
export const PROJECT_TEMPLATES = [
  'angular-cli',
  'create-react-app',
  'html',
  'javascript',
  'node',
  'polymer',
  'typescript',
  'vue',
] as const;
