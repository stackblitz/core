export interface RequestData {
  type: string;
  payload: {
    __reqid?: string;
    [key: string]: any;
  };
}

export type ProjectTemplate = 'angular-cli' | 'create-react-app' | 'javascript' | 'node' | 'polymer' | 'html' | 'typescript' | 'vue';

export interface Project {
  title: string;
  description: string;
  template: ProjectTemplate;
  files: {
    [path: string]: string;
  };
  dependencies?: {
    [name: string]: string;
  };
  settings?: {
    compile?: {
      trigger?: 'auto' | 'keystroke' | 'save' | string;
      action?: 'hmr' | 'refresh' | string;
      clearConsole?: boolean;
    };
  };
  /** @deprecated Tags are ignored by the StackBlitz SDK since v1.5.4 */
  tags?: string[];
}
export interface ProjectOptions {
  openFile?: string | string[];
  hideDevTools?: boolean;
  devToolsHeight?: number;
  origin?: string;
}

export interface OpenOptions extends ProjectOptions {
  newWindow?: boolean;
}

export interface EmbedOptions extends ProjectOptions {
  clickToLoad?: boolean;
  view?: 'preview' | 'editor';
  theme?: 'light' | 'dark';
  height?: number | string;
  width?: number | string;
  hideExplorer?: boolean;
  hideNavigation?: boolean;
  forceEmbedLayout?: boolean;
}
