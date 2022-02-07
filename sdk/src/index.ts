import { Project, OpenOptions, EmbedOptions } from './interfaces';
import { Connection, getConnection } from './connection';
import { openProject, createProjectFrameHTML } from './generate';
import {
  replaceAndEmbed,
  buildProjectQuery,
  elementFromElementOrId,
  openTarget,
  getOrigin,
} from './helpers';
import { VM } from './VM';

const StackBlitzSDK = {
  connect(frameEl: HTMLIFrameElement): Promise<VM> {
    // Validate whether this is a legit iframe on the page.
    if (!frameEl || !frameEl.contentWindow) {
      return Promise.reject('Provided element is not an iframe.');
    }

    // If it's an iframe, first check if there's already a connection for it
    const currentConnection = getConnection(frameEl);
    if (currentConnection) {
      return currentConnection.pending;
    }

    // If no active connection, create one.
    const connection = new Connection(frameEl);
    return connection.pending;
  },

  // Open in new tab methods

  openGithubProject(repoSlug: string, options?: OpenOptions) {
    window.open(
      `${getOrigin(options)}/github/${repoSlug}${buildProjectQuery(options)}`,
      openTarget(options)
    );
  },

  openProject(project: Project, options?: OpenOptions) {
    openProject(project, options);
  },

  openProjectId(projectId: string, options?: OpenOptions) {
    window.open(
      `${getOrigin(options)}/edit/${projectId}${buildProjectQuery(options)}`,
      openTarget(options)
    );
  },

  // Embed on page methods

  embedGithubProject(
    elementOrId: string | HTMLElement,
    repoSlug: string,
    options?: EmbedOptions
  ): Promise<VM> {
    const element = elementFromElementOrId(elementOrId);
    const frame = document.createElement('iframe');
    frame.src = `${getOrigin(options)}/github/${repoSlug}${buildProjectQuery(options)}`;

    replaceAndEmbed(element, frame, options);

    return StackBlitzSDK.connect(frame);
  },

  embedProject(
    elementOrId: string | HTMLElement,
    project: Project,
    options?: EmbedOptions
  ): Promise<VM> {
    const element = elementFromElementOrId(elementOrId);
    const html = createProjectFrameHTML(project, options);
    const frame = document.createElement('iframe');

    replaceAndEmbed(element, frame, options);

    // HTML needs to be written after iframe is embedded
    frame.contentDocument && frame.contentDocument.write(html);

    return StackBlitzSDK.connect(frame);
  },

  embedProjectId(
    elementOrId: string | HTMLElement,
    projectId: string,
    options?: EmbedOptions
  ): Promise<VM> {
    const element = elementFromElementOrId(elementOrId);
    const frame = document.createElement('iframe');
    frame.src = `${getOrigin(options)}/edit/${projectId}${buildProjectQuery(options)}`;

    replaceAndEmbed(element, frame, options);

    return StackBlitzSDK.connect(frame);
  },
};

export default StackBlitzSDK;
