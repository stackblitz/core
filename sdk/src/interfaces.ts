export interface Project {
  title: string;
  description: string;
  template: string;
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

export type OpenFilePath = string | string[];
export type UiView = 'default' | 'preview' | 'editor';
export type UiTheme = 'default' | 'light' | 'dark';

export interface ProjectOptions {
  openFile?: OpenFilePath;
  hideDevTools?: boolean;
  devToolsHeight?: number;
  origin?: string;
}

export interface OpenOptions extends ProjectOptions {
  newWindow?: boolean;
}

export interface EmbedOptions extends ProjectOptions {
  clickToLoad?: boolean;
  view?: UiView;
  theme?: UiTheme;
  height?: number | string;
  width?: number | string;
  hideExplorer?: boolean;
  hideNavigation?: boolean;
  forceEmbedLayout?: boolean;
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
