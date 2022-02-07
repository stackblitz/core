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

import {deploy} from 'firebase-tools';
/**
 * Firebase deployments require a valid auth token and project ID.
 * Tokens can be generated from oAuth or hard coded from `firebase login:ci`.
 * Files in the specified cwd are read & deployed.
 */
export function firebaseDeploy(config: {
  project: string,
  token: string,
  cwd: string,
}): Promise<any> {
  const {project, token, cwd} = config;
  /**
   * Programmatic deploys use source cwd by default.
   * To fix this, we explicitly change cwd on process first.
   */
  process.chdir(cwd);
  return deploy({
    project,
    token,
    cwd
  });
}
