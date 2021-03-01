'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-ae0ba824.js');
const patch = require('./patch-b12280d4.js');

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patch.patchEsm().then(() => {
  return index.bootstrapLazy([["connect-modal.cjs",[[1,"connect-modal",{"authOptions":[16],"openedInstall":[32]}]]]], options);
  });
};

exports.defineCustomElements = defineCustomElements;
