'use strict';

const xdg = require('@folder/xdg');

const loadEnv = options => {
  const platform = process.platform === 'win32' ? 'win32' : 'linux';
  const dirs = xdg({ expanded: true, platform, ...options });

  const configs = [
    dirs.config.parse('../.env'),
    dirs.config.parse('.env'),
    dirs.local.parse('.env')
  ];

  return Object.assign({}, ...configs);
};

module.exports = loadEnv;
module.exports.loadEnv = loadEnv;
