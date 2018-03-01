import { Project, EmbedOptions, OpenOptions } from './interfaces';
import { buildProjectQuery, openTarget } from './helpers';

const SUPPORTED_TEMPLATES = ['typescript', 'create-react-app', 'angular-cli', 'javascript'];

function createHiddenInput(name: string, value: string){
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
}

function createProjectForm(project: Project){
  if(SUPPORTED_TEMPLATES.indexOf(project.template) === -1){
    throw new Error(`Unsupported project template, must be one of: ${SUPPORTED_TEMPLATES.join(', ')}`);
  }

  const form = document.createElement('form');

  form.method = 'POST';
  form.setAttribute('style', 'display:none;');

  form.appendChild(createHiddenInput('project[title]', project.title));
  form.appendChild(createHiddenInput('project[description]', project.description));
  form.appendChild(createHiddenInput('project[template]', project.template));

  if(project.tags){
    project.tags.forEach((tag, index) => {
      form.appendChild(createHiddenInput(`project[tags][${index}]`, tag));
    });
  }

  if(project.dependencies){
    form.appendChild(createHiddenInput('project[dependencies]', JSON.stringify(project.dependencies)));
  }

  Object.keys(project.files).forEach(path => {
    form.appendChild(createHiddenInput(`project[files][${path}]`, project.files[path]));
  });

  return form;
}

export function createProjectFrameHTML(project: Project, options?: EmbedOptions){
  const form = createProjectForm(project);
  form.action = `https://stackblitz.com/run${buildProjectQuery(options)}`;
  form.id = 'sb';

  const html = `<html><head><title></title></head><body>${
    form.outerHTML
  }<script>document.getElementById('sb').submit();</script></body></html>`;

  return html;
}

export function openProject(project: Project, options?: OpenOptions){
  const form = createProjectForm(project);
  form.action = `https://stackblitz.com/run${buildProjectQuery(options)}`;
  form.target = openTarget(options);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
