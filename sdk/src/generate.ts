import { Project, ProjectTemplate, EmbedOptions, OpenOptions } from './interfaces';
import { embedUrl, openTarget, openUrl } from './helpers';

const SUPPORTED_TEMPLATES: ProjectTemplate[] = [
  'angular-cli',
  'create-react-app',
  'html',
  'javascript',
  'node',
  'polymer',
  'typescript',
  'vue',
];

function createHiddenInput(name: string, value: string) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
}

function createProjectForm(project: Project) {
  if (!SUPPORTED_TEMPLATES.includes(project.template)) {
    console.warn(`Unsupported project.template: must be one of ${SUPPORTED_TEMPLATES.join(', ')}`);
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
    if (typeof project.files[path] === 'string') {
      form.appendChild(createHiddenInput(`project[files][${path}]`, project.files[path]));
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
