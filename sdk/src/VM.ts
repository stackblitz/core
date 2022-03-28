import type {
  FsDiff,
  OpenFilePath,
  ProjectDependencies,
  ProjectFiles,
  UiTheme,
  UiView,
} from './interfaces';
import { RDC } from './RDC';

export class VM {
  private _rdc: RDC;

  constructor(port: MessagePort, config: { previewOrigin?: string }) {
    this._rdc = new RDC(port);

    Object.defineProperty(this.preview, 'origin', {
      value: typeof config.previewOrigin === 'string' ? config.previewOrigin : null,
      writable: false,
    });
  }

  /**
   * Apply batch updates to the project files in one call.
   */
  applyFsDiff(diff: FsDiff): Promise<null> {
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

  /**
   * Get the project’s defined dependencies.
   *
   * In EngineBlock projects, version numbers represent the resolved dependency versions.
   * In WebContainers-based projects, returns data from the project’s `package.json` without resolving installed version numbers.
   */
  getDependencies(): Promise<ProjectDependencies | null> {
    return this._rdc.request({
      type: 'SDK_GET_DEPS_SNAPSHOT',
      payload: {},
    });
  }

  /**
   * Get a snapshot of the project files and their content.
   */
  getFsSnapshot(): Promise<ProjectFiles | null> {
    return this._rdc.request<{ [path: string]: string }>({
      type: 'SDK_GET_FS_SNAPSHOT',
      payload: {},
    });
  }

  public editor = {
    /**
     * Open one of several files in tabs and/or split panes
     */
    openFile: (path: OpenFilePath): Promise<null> => {
      return this._rdc.request({
        type: 'SDK_OPEN_FILE',
        payload: { path },
      });
    },
    /**
     * Change the color theme
     */
    setTheme: (theme: UiTheme): Promise<null> => {
      return this._rdc.request({
        type: 'SDK_SET_UI_THEME',
        payload: { theme },
      });
    },
    /**
     * Change the display mode of the project
     * - `default`: show the editor and preview pane
     * - `editor`: show the editor pane only
     * - `preview`: show the preview pane only
     */
    setView: (view: UiView): Promise<null> => {
      return this._rdc.request({
        type: 'SDK_SET_UI_VIEW',
        payload: { view },
      });
    },
    /**
     * Change the display mode of the sidebar
     * - true: show the sidebar
     * - false: hide the sidebar
     */
    showSidebar: (visible: boolean = true): Promise<null> => {
      return this._rdc.request({
        type: 'SDK_TOGGLE_SIDEBAR',
        payload: { visible },
      });
    },
  };

  public preview = {
    /**
     * The origin (protocol and domain) of the preview iframe.
     *
     * In WebContainers-based projects, the origin will always be `null`;
     * try using `vm.preview.getUrl` instead.
     *
     * @see https://developer.stackblitz.com/docs/platform/available-environments
     */
    origin: '' as string | null,
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
    getUrl: (): Promise<string | null> => {
      return this._rdc.request<string | null>({
        type: 'SDK_GET_PREVIEW_URL',
        payload: {},
      });
    },
    /**
     * Change the path of the preview URL.
     *
     * In WebContainers-based projects, this will be ignored if there is no
     * currently running web server.
     *
     * @since 1.7.0
     * @experimental
     */
    setUrl: (path: string = '/'): Promise<null> => {
      return this._rdc.request<null>({
        type: 'SDK_SET_PREVIEW_URL',
        payload: { path },
      });
    },
  };
}
