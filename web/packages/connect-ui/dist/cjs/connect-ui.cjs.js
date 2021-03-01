'use strict';

const index = require('./index-ae0ba824.js');
const patch = require('./patch-b12280d4.js');

patch.patchBrowser().then(options => {
  return index.bootstrapLazy([["connect-modal.cjs",[[1,"connect-modal",{"authOptions":[16],"openedInstall":[32]}]]]], options);
});
