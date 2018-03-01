import { RDC } from './RDC';

export interface VMConfig {
  previewOrigin: string
}

export class VM {
  private rdc: RDC;
  public editor: any;
  public preview: any;

  constructor(port: MessagePort, config: VMConfig) {
    this.rdc = new RDC(port);

    this.preview = {}
    Object.defineProperty(this.preview, 'origin', {
      value: config.previewOrigin,
      writable: false
    })

    this.editor = {
      openFile: (path: string) => {
        return this.rdc.request({
          type: 'SDK_OPEN_FILE',
          payload: {path}
        })
      }
    }
  }

  applyFsDiff(diff: {create: {[path: string]: string}, destroy: string[]}) {
    // Need to do validations on the DIFF object here.
    return this.rdc.request({
      type: 'SDK_APPLY_FS_DIFF',
      payload: diff
    })
  }
  getFsSnapshot() {
    return this.rdc.request({
      type: 'SDK_GET_FS_SNAPSHOT',
      payload: {}
    })
  }
  getDependencies() {
    return this.rdc.request({
      type: 'SDK_GET_DEPS_SNAPSHOT',
      payload: {}
    })
  }
}
