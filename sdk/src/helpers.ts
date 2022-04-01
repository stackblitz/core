import { EmbedOptions, OpenOptions } from './interfaces';

const DEFAULT_ORIGIN = 'https://stackblitz.com';
const DEFAULT_FRAME_HEIGHT = '300';

/**
 * Pseudo-random id string for internal accounting.
 * 8 characters long, and collisions around 1 per million.
 */
export function genID() {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

export function openUrl(route: string, options?: OpenOptions) {
  return `${getOrigin(options)}${route}${buildProjectQuery(options)}`;
}

export function embedUrl(route: string, options?: EmbedOptions) {
  const config: EmbedOptions = {
    forceEmbedLayout: true,
  };
  if (options && typeof options === 'object') {
    Object.assign(config, options);
  }
  return `${getOrigin(config)}${route}${buildProjectQuery(config)}`;
}

function getOrigin(options: OpenOptions | EmbedOptions = {}) {
  if (typeof options.origin === 'string') {
    return options.origin;
  }
  return DEFAULT_ORIGIN;
}

function buildProjectQuery(options: OpenOptions | EmbedOptions = {}) {
  const params: string[] = [];

  if (options.forceEmbedLayout) {
    params.push('embed=1');
  }

  if (options.clickToLoad) {
    params.push('ctl=1');
  }

  for (const file of Array.isArray(options.openFile) ? options.openFile : [options.openFile]) {
    if (typeof file === 'string' && file.trim() !== '') {
      params.push(`file=${encodeURIComponent(file.trim())}`);
    }
  }

  if (options.view === 'preview' || options.view === 'editor') {
    params.push(`view=${options.view}`);
  }

  if (options.theme === 'light' || options.theme === 'dark') {
    params.push(`theme=${options.theme}`);
  }

  if (options.hideExplorer) {
    params.push('hideExplorer=1');
  }

  if (options.hideNavigation) {
    params.push('hideNavigation=1');
  }

  if (options.hideDevTools) {
    params.push('hideDevTools=1');
  }

  if (
    typeof options.devToolsHeight === 'number' &&
    options.devToolsHeight >= 0 &&
    options.devToolsHeight <= 100
  ) {
    params.push(`devToolsHeight=${Math.round(options.devToolsHeight)}`);
  }

  return params.length ? `?${params.join('&')}` : '';
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
    frame.height = DEFAULT_FRAME_HEIGHT;
  }
  if (!frame.width) {
    frame.setAttribute('style', 'width:100%;');
  }
}
