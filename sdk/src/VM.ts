import { RDC } from './RDC';

interface VMConfig {
  previewOrigin: string;
}

interface VMFsDiff {
  create: { [path: string]: string };
  destroy: string[];
}

export class VM {
  private rdc: RDC;

  public editor: {
    openFile: (path: string) => Promise<null>;
  };

  public preview: {
    readonly origin: string;
  };

  constructor(port: MessagePort, config: VMConfig) {
    this.rdc = new RDC(port);

    this.preview = Object.defineProperty({ origin: '' }, 'origin', {
      value: config.previewOrigin,
      writable: false,
    });

    this.editor = {
      openFile: (path: string) => {
        return this.rdc.request({
          type: 'SDK_OPEN_FILE',
          payload: { path },
        });
      },
    };
  }

  applyFsDiff(diff: VMFsDiff) {
    const isObject = (val: any) => val !== null && typeof val === 'object';
    if (!isObject(diff) || !isObject(diff.create)) {
      throw new Error('Invalid diff object: expected diff.create to be an object.');
    } else if (!Array.isArray(diff.destroy)) {
      throw new Error('Invalid diff object: expected diff.create to be an array.');
    }

    return this.rdc.request({
      type: 'SDK_APPLY_FS_DIFF',
      payload: diff,
    });
  }

  getFsSnapshot() {
    return this.rdc.request<{ [path: string]: string }>({
      type: 'SDK_GET_FS_SNAPSHOT',
      payload: {},
    });
  }

  getDependencies() {
    return this.rdc.request<{ [name: string]: string }>({
      type: 'SDK_GET_DEPS_SNAPSHOT',
      payload: {},
    });
  }
}
