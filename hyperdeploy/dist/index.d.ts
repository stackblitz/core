/**
    __                              __           __
   / /_  __  ______  ___  _________/ /__  ____  / /___  __  __
  / __ \/ / / / __ \/ _ \/ ___/ __  / _ \/ __ \/ / __ \/ / / /
 / / / / /_/ / /_/ /  __/ /  / /_/ /  __/ /_/ / / /_/ / /_/ /
/_/ /_/\__, / .___/\___/_/   \__,_/\___/ .___/_/\____/\__, /
      /____/_/                        /_/            /____/

 * This library is designed for usage inside Firebase Cloud Functions.
 * Client must finish all writes to FS before invoking.
 * Compilation and transit ops handled by consumer libs.
 */
/**
 * Firebase deployments require a valid auth token and project ID.
 * Tokens can be generated from oAuth or hard coded from `firebase login:ci`.
 * Files in the specified cwd are read & deployed.
 */
export declare function deployFirebase(config: {
    project: string;
    token: string;
    cwd: string;
}): Promise<any>;
