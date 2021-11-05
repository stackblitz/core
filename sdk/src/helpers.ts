import { ProjectOptions, EmbedOptions, OpenOptions } from './interfaces';

export function getOrigin(options?: ProjectOptions | OpenOptions | EmbedOptions) {
  if (options && options.origin) return options.origin;
  return 'https://stackblitz.com';
}

const DEFAULT_FRAME_HEIGHT = '300';

export function genID() {
  return Math.random().toString(36).substring(7);
}

export function buildProjectQuery(options?: EmbedOptions){
  const params = [];

  if(options){
    if(options.forceEmbedLayout) {
      params.push('embed=1');
    }

    if(options.clickToLoad){
      params.push('ctl=1');
    }

    if(typeof options.openFile === 'string'){
      params.push(`file=${options.openFile}`);
    }

    if(options.view === 'preview' || options.view === 'editor'){
      params.push(`view=${options.view}`);
    }

    if(options.theme === 'light' || options.theme === 'dark'){
      params.push(`theme=${options.theme}`);
    }

    if(options.hideExplorer){
      params.push('hideExplorer=1');
    }

    if(options.hideNavigation){
      params.push('hideNavigation=1');
    }

    if(options.hideDevTools){
      params.push('hidedevtools=1');
    }

    if(typeof options.devToolsHeight === 'number' && options.devToolsHeight >= 0 && options.devToolsHeight <= 100){
      params.push(`devtoolsheight=${Math.round(options.devToolsHeight)}`);
    }
  }

  return params.length ? `?${params.join('&')}` : '';
}

export function replaceAndEmbed(parent: HTMLElement, frame: HTMLIFrameElement, options?: EmbedOptions){
  if(parent.parentNode !== null){
    frame.id = parent.id;
    setFrameDimensions(frame, options);
    parent.parentNode.replaceChild(frame, parent);
  } else {
    throw new Error('Invalid Element');
  }
}

export function elementFromElementOrId(elementOrId: string | HTMLElement){
  if('string' === typeof elementOrId){
    const element = document.getElementById(elementOrId)

    if(element !== null){
      return element;
    }
  } else if (elementOrId instanceof HTMLElement){
    return elementOrId;
  }

  throw new Error('Invalid Element');
}

export function openTarget(options?: OpenOptions){
  return (options && options.newWindow === false) ? '_self' : '_blank';
}

function setFrameDimensions(frame: HTMLIFrameElement, options?: EmbedOptions){
  if(options){
    if(options.hasOwnProperty('height')){
      frame.height = `${options.height}`;
    }

    if(options.hasOwnProperty('width')){
      frame.width = `${options.width}`;
    }
  }

  if(!frame.height){
    frame.height = DEFAULT_FRAME_HEIGHT;
  }
  if(!frame.width){
    frame.setAttribute('style', 'width:100%;');
  }
}
