import { genID } from './helpers';

interface MessageData {
  type: string;
  payload: MessagePayload;
}

interface MessagePayload {
  __reqid: string;
  __success: boolean;
  __error?: string;
  [key: string]: any;
}

interface RequestData {
  type: string;
  payload: { [key: string]: any };
}

interface PendingResolvers {
  [id: string]: {
    resolve(value: { [key: string]: any } | null): void;
    reject(error: string): void;
  };
}

export class RDC {
  private port: MessagePort;
  private pending: PendingResolvers = {};

  constructor(port: MessagePort) {
    this.port = port;
    this.port.onmessage = this.messageListener.bind(this);
  }

  public request<T = null>({ type, payload }: RequestData): Promise<T | null> {
    // Generate request ID
    const id = genID();
    return new Promise((resolve, reject) => {
      this.pending[id] = { resolve, reject };
      this.port.postMessage({
        type,
        payload: {
          ...payload,
          // Ensure the payload object includes the request ID
          __reqid: id,
        },
      });
    });
  }

  private messageListener(event: MessageEvent<MessageData>) {
    if (typeof event.data.payload?.__reqid !== 'string') {
      return;
    }

    const { type, payload } = event.data;
    const { __reqid: id, __success: success, __error: error } = payload;

    if (this.pending[id]) {
      if (success) {
        this.pending[id].resolve(cleanResult(payload));
      } else {
        this.pending[id].reject(error ? `${type}: ${error}` : type);
      }
      delete this.pending[id];
    }
  }
}

function cleanResult(payload: MessagePayload): { [key: string]: any } | null {
  const result: Partial<typeof payload> = { ...payload };
  delete result.__reqid;
  delete result.__success;
  delete result.__error;
  // Null the result if payload was empty besides the private metadata fields
  return Object.keys(result).length ? result : null;
}
