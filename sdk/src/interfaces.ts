import { VM } from './VM';

export interface RequestData {
  type: string,
  payload: {
    __reqid?: string;
    [key: string]: any;
  }
}

export interface Project {
  files: {[path: string]: string};
  title: string;
  description: string;
  template: 'angular-cli' | 'create-react-app' | 'typescript' | 'javascript' | string;
  tags?: string[];
  dependencies?: {[name: string]: string};
}

export interface ProjectOptions {
  openFile?: string;
}

export interface OpenOptions extends ProjectOptions {
  newWindow?: boolean;
}

export interface EmbedOptions extends ProjectOptions {
  clickToLoad?: boolean;
  view?: 'preview' | 'editor' | string;
  height?: number | string;
  width?: number | string;
  hideExplorer?: boolean;
  hideNavigation?: boolean;
  forceEmbedLayout?: boolean;
}
