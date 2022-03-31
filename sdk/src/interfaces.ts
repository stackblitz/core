interface ProjectSettings {
  compile?: {
    trigger?: 'auto' | 'keystroke' | 'save' | string;
    action?: 'hmr' | 'refresh' | string;
    clearConsole?: boolean;
  };
}

export type ProjectTemplate = 'angular-cli' | 'create-react-app' | 'html' | 'javascript' | 'node' | 'polymer' | 'typescript' | 'vue';
export type ProjectDependencies = { [name: string]: string };
export type ProjectFiles = { [path: string]: string };

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

export type OpenFilePath = string | string[];
export type UiView = 'default' | 'preview' | 'editor';
export type UiTheme = 'default' | 'light' | 'dark';

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
  openFile?: OpenFilePath;
  /**
   * Show only the code editor or only the preview page.
   *
   * Defaults to showing both the editor and the preview.
   */
  view?: UiView;
  /**
   * Select the color theme for the editor UI.
   *
   * Available themes: `light` and `dark`.
   */
  theme?: UiTheme;
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
   * Hide the sidebar on page load.
   *
   * Users will still be able to open the sidebar by clicking one of the sidebar icons.
   */
  hideExplorer?: boolean;
  /**
   * Hide the preview URL.
   */
  hideNavigation?: boolean;
  /**
   * Use the “embed” layout of the editor.
   * Defaults to `false`; we recommend setting it to true when using the `embedProject*` methods.
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
}

export interface FsDiff {
  create: {
    [path: string]: string;
  };
  destroy: string[];
}

export interface RequestData {
  type: string;
  payload: {
    __reqid?: string;
    [key: string]: any;
  };
}
