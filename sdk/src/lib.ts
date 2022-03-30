import type { Project, OpenOptions, EmbedOptions } from './interfaces';
import type { VM } from './VM';
import { Connection, getConnection } from './connection';
import { openNewProject, createProjectFrameHTML } from './generate';
import {
  replaceAndEmbed,
  buildProjectQuery,
  elementFromElementOrId,
  openTarget,
  getOrigin,
} from './helpers';

/**
 * Get a VM instance for an existing StackBlitz project iframe.
 */
export function connect(frameEl: HTMLIFrameElement): Promise<VM> {
  if (!frameEl?.contentWindow) {
    return Promise.reject('Provided element is not an iframe.');
  }
  const connection = getConnection(frameEl) ?? new Connection(frameEl);
  return connection.pending;
}

/**
 * Open an existing StackBlitz project in a new tab (or in the current window).
 */
export function openProject(project: Project, options?: OpenOptions) {
  openNewProject(project, options);
}

/**
 * Open an existing StackBlitz project in a new tab (or in the current window).
 */
export function openProjectId(projectId: string, options?: OpenOptions) {
  window.open(
    `${getOrigin(options)}/edit/${projectId}${buildProjectQuery(options)}`,
    openTarget(options)
  );
}

/**
 * Open a project from Github and open it in a new tab (or in the current window).
 *
 * Example usage:
 *
 *     sdk.openGithubProject('some/repository');
 *     sdk.openGithubProject('some/repository/tree/some-branch');
 */
export function openGithubProject(repoSlug: string, options?: OpenOptions) {
  window.open(
    `${getOrigin(options)}/github/${repoSlug}${buildProjectQuery(options)}`,
    openTarget(options)
  );
}

/**
 * Create a new project and embed it on the current page.
 *
 * Returns a promise resolving to a VM instance.
 */
export function embedProject(
  elementOrId: string | HTMLElement,
  project: Project,
  options?: EmbedOptions
): Promise<VM> {
  const element = elementFromElementOrId(elementOrId);
  const html = createProjectFrameHTML(project, options);
  const frame = document.createElement('iframe');

  replaceAndEmbed(element, frame, options);

  // HTML needs to be written after iframe is embedded
  frame.contentDocument?.write(html);

  return connect(frame);
}

/**
 * Embeds an existing StackBlitz project on the current page.
 *
 * Returns a promise resolving to a VM instance.
 */
export function embedProjectId(
  elementOrId: string | HTMLElement,
  projectId: string,
  options?: EmbedOptions
): Promise<VM> {
  const element = elementFromElementOrId(elementOrId);
  const frame = document.createElement('iframe');
  frame.src = `${getOrigin(options)}/edit/${projectId}${buildProjectQuery(options)}`;

  replaceAndEmbed(element, frame, options);

  return connect(frame);
}

/**
 * Embeds a project from Github on the current page.
 *
 * Returns a promise resolving to a VM instance.
 */
export function embedGithubProject(
  elementOrId: string | HTMLElement,
  repoSlug: string,
  options?: EmbedOptions
): Promise<VM> {
  const element = elementFromElementOrId(elementOrId);
  const frame = document.createElement('iframe');
  frame.src = `${getOrigin(options)}/github/${repoSlug}${buildProjectQuery(options)}`;

  replaceAndEmbed(element, frame, options);

  return connect(frame);
}
