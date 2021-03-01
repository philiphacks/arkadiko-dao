import { b as bootstrapLazy } from './index-655c1ebb.js';
import { p as patchBrowser } from './patch-efaa0b2c.js';

patchBrowser().then(options => {
  return bootstrapLazy([["connect-modal",[[1,"connect-modal",{"authOptions":[16],"openedInstall":[32]}]]]], options);
});
