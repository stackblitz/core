import { VM } from './VM';
import { genID } from './helpers';

const connections: Connection[] = [];

export class Connection {
  element: HTMLIFrameElement;
  id: string;
  pending: Promise<VM>;
  vm: VM;

  constructor(element: HTMLIFrameElement) {
    this.id = genID();
    this.element = element;
    this.pending = new Promise<VM>((resolve, reject) => {
      const listenForSuccess = ({ data, ports }: MessageEvent) => {
        if (data?.action === 'SDK_INIT_SUCCESS' && data.id === this.id) {
          this.vm = new VM(ports[0], data.payload);
          resolve(this.vm);
          cleanup();
        }
      };

      const pingFrame = () => {
        // Ping the Iframe.
        this.element.contentWindow &&
          this.element.contentWindow.postMessage(
            {
              action: 'SDK_INIT',
              id: this.id,
            },
            '*'
          );
      };

      // Remove the listener and interval.
      function cleanup() {
        window.clearInterval(interval);
        window.removeEventListener('message', listenForSuccess);
      }

      // First we want to set up the listener for the frame
      window.addEventListener('message', listenForSuccess);
      // Then, lets immediately ping the frame.
      pingFrame();
      // Every 500ms thereafter we'll ping until we get a response or timeout.
      // Keep track of the current try # and the max #
      const maxAttempts = 20;
      let attempts = 0;
      const interval = window.setInterval(() => {
        // If the VM connection is open, cleanup and return
        // This shouldn't ever happen, but just in case there's some race condition...
        if (!!this.vm) {
          cleanup();
          return;
        }

        // If we've exceeded the max retries, fail this promise.
        if (attempts >= maxAttempts) {
          cleanup();
          reject('Timeout: Unable to establish a connection with the StackBlitz VM');
          // Remove the (now) failed connection from the connections array
          connections.forEach((connection, index) => {
            if (connection.id === this.id) {
              connections.splice(index, 1);
            }
          });
          return;
        }

        attempts++;
        pingFrame();
      }, 500);
    });

    connections.push(this);
  }
}

// Accepts either the frame element OR the id.
export const getConnection = (identifier: string | HTMLIFrameElement) => {
  const key = identifier instanceof Element ? 'element' : 'id';
  return connections.find((c) => c[key] === identifier) ?? null;
};
