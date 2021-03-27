# Setup HOWTO

This is high-level. Will be more granular as Arkadiko matures.

1. Set up a local mocknet through docker compose
2. Change the default Stacks amount of the local mocknet addresses in the toml files
3. Run the liquidator test to deploy all smart contracts (`npm test clarity/test/unit/liquidator.ts`)
4. Run the web app using `yarn dev`
5. Go to localhost:3000. You need the Stacks Web Wallet to authenticate.
