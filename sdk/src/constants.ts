/**
 * Number of milliseconds between attempts to get a response from an embedded frame
 */
export const connectInterval = 500;

/**
 * How many times should we try to get an init response from an embedded frame
 */
export const connectMaxAttempts = 20;

/**
 * Default height attribute for iframes
 */
export const defaultFrameHeight = 300;

/**
 * Origin of the StackBlitz instance
 */
export const defaultOrigin = 'https://stackblitz.com';

/**
 * List of supported template names.
 */
export const projectTemplates = [
  'angular-cli',
  'create-react-app',
  'html',
  'javascript',
  'node',
  'polymer',
  'typescript',
  'vue',
] as const;
