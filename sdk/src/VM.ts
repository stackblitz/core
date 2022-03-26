import type { FsDiff, OpenFilePath, UiTheme, UiView } from './interfaces';
import { RDC } from './RDC';

interface VMEditor {
  /**
   * Open one of several files in tabs and/or split panes
   */
  openFile(path: OpenFilePath): Promise<null>;

  /**
   * Change the color theme
   */
  setTheme(theme: UiTheme): Promise<null>;

  /**
   * Change the display mode of the project
   * - 'default': show the editor and preview pane
   * - 'editor': show the editor pane only
   * - 'preview': show the preview pane only
   */
  setView(view: UiView): Promise<null>;

  /**
   * Change the display mode of the sidebar
   * - true: show the sidebar
   * - false: hide the sidebar
   */
  showSidebar(visible?: boolean): Promise<null>;
}

interface VMPreview {
  /**
   * The origin (protocol and domain) of the preview iframe.
   *
   * In WebContainers-based projects, the origin will always be `null`;
   * try using `vm.preview.getUrl` instead.
   *
   * @see https://developer.stackblitz.com/docs/platform/available-environments
   */
  readonly origin?: string | null;

  /**
   * Get the current preview URL.
   *
   * In both and EngineBlock and WebContainers-based projects, the preview URL
   * may not reflect the exact path of the current page, after user navigation.
   *
   * In WebContainers-based projects, the preview URL will be `null` initially,
   * and until the project starts a web server.
   *
   * @since 1.7.0
   * @experimental
   */
  getUrl(): Promise<string | null>;

  /**
   * Change the path of the preview URL.
   *
   * In WebContainers-based projects, this will be ignored if there is no
   * currently running web server.
   *
   * @since 1.7.0
   * @experimental
   */
  setUrl(path: string): Promise<null>;
}

export class VM {
  private _rdc: RDC;
  private _previewOrigin: string | null;
  private _previewUrl: string | null;

  constructor(port: MessagePort, config: { previewOrigin?: string }) {
    this._rdc = new RDC(port);

    Object.defineProperty(this.preview, 'origin', {
      value: config.previewOrigin,
      writable: false,
    });
  }

  public editor: VMEditor = {
    openFile: (path) => {
      return this._rdc.request({
        type: 'SDK_OPEN_FILE',
        payload: { path },
      });
    },
    setTheme: (theme) => {
      return this._rdc.request({
        type: 'SDK_SET_UI_THEME',
        payload: { theme },
      });
    },
    setView: (view) => {
      return this._rdc.request({
        type: 'SDK_SET_UI_VIEW',
        payload: { view },
      });
    },
    showSidebar: (visible = true) => {
      return this._rdc.request({
        type: 'SDK_TOGGLE_SIDEBAR',
        payload: { visible },
      });
    },
  };

  public preview: VMPreview = {
    origin: '',
    getUrl: () => {
      return this._rdc.request<string | null>({
        type: 'SDK_GET_PREVIEW_URL',
        payload: {},
      });
    },
    setUrl: (path = '/') => {
      return this._rdc.request<null>({
        type: 'SDK_SET_PREVIEW_URL',
        payload: { path },
      });
    },
  };

  getDependencies() {
    return this._rdc.request<{ [name: string]: string }>({
      type: 'SDK_GET_DEPS_SNAPSHOT',
      payload: {},
    });
  }

  applyFsDiff(diff: FsDiff) {
    const isObject = (val: any) => val !== null && typeof val === 'object';
    if (!isObject(diff) || !isObject(diff.create)) {
      throw new Error('Invalid diff object: expected diff.create to be an object.');
    } else if (!Array.isArray(diff.destroy)) {
      throw new Error('Invalid diff object: expected diff.create to be an array.');
    }

    return this._rdc.request({
      type: 'SDK_APPLY_FS_DIFF',
      payload: diff,
    });
  }

  getFsSnapshot() {
    return this._rdc.request<{ [path: string]: string }>({
      type: 'SDK_GET_FS_SNAPSHOT',
      payload: {},
    });
  }
}
