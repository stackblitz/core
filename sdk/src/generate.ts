import type { Project, EmbedOptions, OpenOptions } from './interfaces';
import { PROJECT_TEMPLATES } from './constants';
import { embedUrl, openTarget, openUrl } from './helpers';

function createHiddenInput(name: string, value: string) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
}

/**
 * Encode file paths for use in input name attributes.
 * We need to replace square brackets (as used by Next.js, SvelteKit, etc.),
 * with custom escape sequences. Important: do not encodeURIComponent the
 * whole path, for compatibility with the StackBlitz backend.
 */
function bracketedFilePath(path: string) {
  return `[${path.replace(/\[/g, '%5B').replace(/\]/g, '%5D')}]`;
}

function createProjectForm(project: Project) {
  if (!PROJECT_TEMPLATES.includes(project.template)) {
    const names = PROJECT_TEMPLATES.map((t) => `'${t}'`).join(', ');
    console.warn(`Unsupported project.template: must be one of ${names}`);
  }

  const isWebContainers = project.template === 'node';

  const form = document.createElement('form');
  form.method = 'POST';
  form.setAttribute('style', 'display:none!important;');

  form.appendChild(createHiddenInput('project[title]', project.title));
  form.appendChild(createHiddenInput('project[description]', project.description));
  form.appendChild(createHiddenInput('project[template]', project.template));

  if (project.dependencies) {
    if (isWebContainers) {
      console.warn(
        `Invalid project.dependencies: dependencies must be provided as a 'package.json' file when using the 'node' template.`
      );
    } else {
      form.appendChild(
        createHiddenInput('project[dependencies]', JSON.stringify(project.dependencies))
      );
    }
  }

  if (project.settings) {
    form.appendChild(createHiddenInput('project[settings]', JSON.stringify(project.settings)));
  }

  Object.keys(project.files).forEach((path) => {
    const name = 'project[files]' + bracketedFilePath(path);
    const value = project.files[path];
    if (typeof value === 'string') {
      form.appendChild(createHiddenInput(name, value));
    }
  });

  return form;
}

export function createProjectFrameHTML(project: Project, options?: EmbedOptions) {
  const form = createProjectForm(project);
  form.action = embedUrl('/run', options);
  form.id = 'sb';

  const html = `<html><head><title></title></head><body>${form.outerHTML}<script>document.getElementById('${form.id}').submit();</script></body></html>`;

  return html;
}

export function openNewProject(project: Project, options?: OpenOptions) {
  const form = createProjectForm(project);
  form.action = openUrl('/run', options);
  form.target = openTarget(options);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
