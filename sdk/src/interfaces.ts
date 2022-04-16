export interface Project {
  title: string;
  description: string;
  /**
   * The project’s template name tells StackBlitz how to compile and run project files.
   *
   * Template values supported on https://stackblitz.com include:
   * - EngineBlock environment: `angular-cli`, `create-react-app`, `javascript`, `polymer`, `typescript`, `vue`
   * - WebContainers environment: `node`
   *
   * @see https://developer.stackblitz.com/docs/platform/available-environments
   */
  template: ProjectTemplate;
  /**
   * Provide project files, as code strings.
   *
   * Binary files and blobs are not supported.
   */
  files: ProjectFiles;
  /**
   * Define npm dependencies for EngineBlock projects.
   *
   * For WebContainers-based projects (when using `template: 'node'`), this is ignored,
   * and dependencies must be defined in the `package.json` file in the `files` object.
   */
  dependencies?: ProjectDependencies;
  settings?: ProjectSettings;
  /**
   * @deprecated Tags are ignored by the StackBlitz SDK since v1.5.4
   */
  tags?: string[];
}

export type ProjectTemplate =
  | 'angular-cli'
  | 'create-react-app'
  | 'html'
  | 'javascript'
  | 'node'
  | 'polymer'
  | 'typescript'
  | 'vue';

export interface ProjectDependencies {
  [name: string]: string;
}

export interface ProjectFiles {
  [path: string]: string;
}

export interface ProjectSettings {
  compile?: {
    trigger?: 'auto' | 'keystroke' | 'save' | string;
    action?: 'hmr' | 'refresh' | string;
    clearConsole?: boolean;
  };
}

export interface ProjectOptions {
  /**
   * Select one or several project files to open initially.
   *
   * Example usage:
   *
   *     // open a single file
   *     openFile: 'src/index.js'
   *
   *     // open three files in three editor tabs
   *     openFile: 'package.json,src/index.js,src/components/App.js'
   *
   *     // open three files in two side-by-side editor panes
   *     openFile: ['package.json,src/index.js', 'src/components/App.js']
   */
  openFile?: OpenFileOption;
  /**
   * Show only the code editor or only the preview page.
   *
   * Defaults to showing both the editor and the preview.
   */
  view?: UiViewOption;
  /**
   * Select the color theme for the editor UI.
   *
   * Available themes: `light` and `dark`.
   */
  theme?: UiThemeOption;
  /**
   * Height of the Console panel below the preview page (as a percentage number, between `0` and `100`).
   *
   * By default, the Console will appear collapsed, and can be opened by users. This option is ignored in WebContainers-based projects.
   */
  devToolsHeight?: number;
  /**
   * Completely hide the Console panel below the preview page.
   *
   * This option is ignored in WebContainers-based projects.
   */
  hideDevTools?: boolean;
  /**
   * Hide the ActivityBar (sidebar icons).
   */
  hideExplorer?: boolean;
  /**
   * Use the “embed” layout of the editor.
   *
   * Defaults to `true` for `embedProject*` methods, and `false` for `openProject*` methods.
   *
   * @deprecated May be removed in a future release.
   */
  forceEmbedLayout?: boolean;
  /**
   * Show a UI dialog asking users to click a button to run the project.
   */
  clickToLoad?: boolean;
  /**
   * Set the origin URL of your StackBlitz EE server.
   * Defaults to `https://stackblitz.com`.
   */
  origin?: string;
}

export interface OpenOptions extends ProjectOptions {
  /**
   * Opens the project in a new browser tab.
   * Defaults to `true`; use `false` to open in the current tab.
   */
  newWindow?: boolean;
}

export interface EmbedOptions extends ProjectOptions {
  /**
   * Height of the embed iframe
   */
  height?: number | string;
  /**
   * Width of the embed iframe (defaults to `100%`)
   */
  width?: number | string;
  /**
   * Hide the preview URL in embeds.
   */
  hideNavigation?: boolean;
}

export type OpenFileOption = string | string[];

export type UiViewOption = 'default' | 'preview' | 'editor';

export type UiThemeOption = 'default' | 'light' | 'dark';
