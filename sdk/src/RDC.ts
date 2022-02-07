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

    this.port.onmessage = (e) => {
      // Handle if this is a response to a request
      if (!!e.data.payload.__reqid) {
        const reqid = e.data.payload.__reqid;
        const success = e.data.payload.__success;

        if (this.pending[reqid]) {
          delete e.data.payload.__reqid;
          delete e.data.payload.__success;

          // If successful, resolve the data.
          if (success) {
            // Null the payload if empty object
            const res =
              Object.keys(e.data.payload).length === 0 && e.data.payload.constructor === Object
                ? null
                : e.data.payload;
            // Resolve the data.
            this.pending[reqid].resolve(res);

            // Otherwise, reject with error message.
          } else {
            const error = e.data.payload.error
              ? `${e.data.type}: ${e.data.payload.error}`
              : e.data.type;
            this.pending[reqid].reject(error);
          }
          delete this.pending[reqid];
        }
      }
      // End request handler
    };
  }

  // Always returns a promise; uniquely ID's messages being sent.
  request(data: RequestData) {
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
