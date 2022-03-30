import { RequestData } from './interfaces';
import { genID } from './helpers';

export class RDC {
  private port: MessagePort;
  private pending: {
    [id: string]: {
      resolve: Function;
      reject: Function;
    };
  } = {};

  constructor(port: MessagePort) {
    this.port = port;

    this.port.onmessage = ({ data }) => {
      // Handle if this is a response to a request
      if (data?.payload?.__reqid) {
        const reqid = data.payload.__reqid;
        const success = data.payload.__success;

        if (this.pending[reqid]) {
          delete data.payload.__reqid;
          delete data.payload.__success;

          if (success) {
            // Null the payload if empty object
            const res =
              Object.keys(data.payload).length === 0 && data.payload.constructor === Object
                ? null
                : data.payload;
            this.pending[reqid].resolve(res);
          } else {
            const error = data.payload.error ? `${data.type}: ${data.payload.error}` : data.type;
            this.pending[reqid].reject(error);
          }

          delete this.pending[reqid];
        }
      }
    };
  }

  // Always returns a promise; uniquely ID's messages being sent.
  request<T = null>(data: RequestData): Promise<T | null> {
    // Generate request ID
    const id = genID();
    return new Promise((resolve, reject) => {
      this.pending[id] = { resolve, reject };

      // Ensure the payload object includes the request ID
      data.payload.__reqid = id;

      this.port.postMessage(data);
    });
  }
}
