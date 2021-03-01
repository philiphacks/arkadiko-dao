import { b as bootstrapLazy } from './index-655c1ebb.js';
import { a as patchEsm } from './patch-efaa0b2c.js';
var defineCustomElements = function (win, options) {
    if (typeof window === 'undefined')
        return Promise.resolve();
    return patchEsm().then(function () {
        return bootstrapLazy([["connect-modal", [[1, "connect-modal", { "authOptions": [16], "openedInstall": [32] }]]]], options);
    });
};
export { defineCustomElements };
