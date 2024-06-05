import logger from './logger.js';

const appleMusicUrlType = {
  'song': 'song',
  'album': 'album',
  'playlist': 'playlist',
  'artist': 'artist'
};

function parseUrl (urlInput) {
  if (typeof urlInput !== 'string') {
    throw new TypeError('urlInput must be string');
  }
  if (urlInput.match(new RegExp('https://music.apple.com/(.{2})/(song|album|playlist|artist).*/(pl.*|\d*)'))) {
    const urlStruct = new URL(urlInput);
    const urlPathArray = urlStruct.pathname.split('/').filter(itr => itr !== '');
    const urlQueryParamObj = new Object();
    urlStruct.searchParams.forEach((value, key) => {urlQueryParamObj[key] = value});
    const retObj = {
      'url': urlInput,
      'type': urlPathArray[1],
      'storefront': urlPathArray[0],
      'id': 0
    };
    if (retObj.type === (appleMusicUrlType.song || appleMusicUrlType.artist || appleMusicUrlType.playlist)) {
      // song link     : https://music.apple.com/jp/song/twilight/1516725224
      // artist link   : https://music.apple.com/jp/artist/honeycomebear/1334924854
      // playlist link : https://music.apple.com/jp/playlist/hoyo-mix-essentials/pl.e5e8ec4e27a34358ba600fe9744c504f
      retObj.id = parseInt(urlPathArray.slice(-1)[0]);
    } else if (retObj.type === appleMusicUrlType.album) {
      // album link    : https://music.apple.com/jp/album/twilight/1516725222
      // song link     : https://music.apple.com/jp/album/twilight/1516725222?i=1516725224
      if ('i' in urlQueryParamObj && urlQueryParamObj['i'] !== '') {
        retObj.type = appleMusicUrlType.song;
        retObj.id = parseInt(urlQueryParamObj.i);
      } else {
        retObj.id = parseInt(urlPathArray.slice(-1)[0]);
      }
    }
    logger.debug(`URL parse result: ${retObj.storefront}, ${retObj.type}, ${retObj.id}`);
    return retObj;
    // expect output: 
    // {
    //   'url': 'https://music.apple.com/jp/album/twilight/1516725222?i=1516725224',
    //   'type': 'song',
    //   'storefront': 'jp',
    //   'id': 1516725224
    // }
  } else {
    throw new Error('Invalid input URI');
  }
}

export default { parseUrl, appleMusicUrlType };
