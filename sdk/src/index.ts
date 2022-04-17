import {
  connect,
  embedGithubProject,
  embedProject,
  embedProjectId,
  openGithubProject,
  openProject,
  openProjectId,
} from './lib';

// Explicitly export public types (vs using `export * from './interfaces'`),
// so that additions to interfaces don't become a part of our public API by mistake.
export type {
  Project,
  ProjectOptions,
  ProjectDependencies,
  ProjectFiles,
  ProjectSettings,
  ProjectTemplate,
  EmbedOptions,
  OpenOptions,
  OpenFileOption,
  UiThemeOption,
  UiViewOption,
} from './interfaces';
export type { FsDiff, VM } from './vm';

// Export a single object with methods, for compatibility with UMD and CommonJS.
// Ideally we would also have named exports, but that can create incompatibilities
// with some bundlers, and microbundle doesn't support it:
// https://github.com/developit/microbundle/issues/712
export default {
  connect,
  embedGithubProject,
  embedProject,
  embedProjectId,
  openGithubProject,
  openProject,
  openProjectId,
};
