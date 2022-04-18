import type { EmbedOptions, OpenOptions } from './interfaces';
import { DEFAULT_FRAME_HEIGHT, DEFAULT_ORIGIN } from './constants';
import { buildParams } from './params';

/**
 * Pseudo-random id string for internal accounting.
 * 8 characters long, and collisions around 1 per million.
 */
export function genID() {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export function openUrl(route: string, options?: OpenOptions) {
  return `${getOrigin(options)}${route}${buildParams(options)}`;
}

export function embedUrl(route: string, options?: EmbedOptions) {
  const config: EmbedOptions = {
    forceEmbedLayout: true,
  };
  if (options && typeof options === 'object') {
    Object.assign(config, options);
  }
  return `${getOrigin(config)}${route}${buildParams(config)}`;
}

function getOrigin(options: OpenOptions & EmbedOptions = {}) {
  if (typeof options.origin === 'string') {
    return options.origin;
  }
  return DEFAULT_ORIGIN;
}

export function replaceAndEmbed(
  parent: HTMLElement,
  frame: HTMLIFrameElement,
  options?: EmbedOptions
) {
  if (!frame || !parent || !parent.parentNode) {
    throw new Error('Invalid Element');
  }
  if (parent.id) frame.id = parent.id;
  if (parent.className) frame.className = parent.className;
  setFrameDimensions(frame, options);
  parent.parentNode.replaceChild(frame, parent);
}

export function findElement(elementOrId: string | HTMLElement) {
  if (typeof elementOrId === 'string') {
    const element = document.getElementById(elementOrId);
    if (!element) {
      throw new Error(`Could not find element with id '${elementOrId}'`);
    }
    return element;
  } else if (elementOrId instanceof HTMLElement) {
    return elementOrId;
  }
  throw new Error(`Invalid element: ${elementOrId}`);
}

export function openTarget(options?: OpenOptions) {
  return options && options.newWindow === false ? '_self' : '_blank';
}

function setFrameDimensions(frame: HTMLIFrameElement, options?: EmbedOptions) {
  if (options && typeof options === 'object') {
    if (Object.hasOwnProperty.call(options, 'height')) {
      frame.height = `${options.height}`;
    }
    if (Object.hasOwnProperty.call(options, 'width')) {
      frame.width = `${options.width}`;
    }
  }

  if (!frame.height) {
    frame.height = `${DEFAULT_FRAME_HEIGHT}`;
  }
  if (!frame.width) {
    frame.setAttribute('style', 'width:100%;');
  }
}
