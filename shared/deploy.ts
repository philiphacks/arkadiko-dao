import { deployContract } from "./utils";

export async function deploy() {
  await deployContract('vault-trait.clar');
  await deployContract('oracle.clar');
  await deployContract('arkadiko-token.clar');
  await deployContract('stx-reserve.clar');

  await deployContract('liquidator.clar');
  await deployContract('stacker-registry.clar');
  await deployContract('auction-engine.clar');
};

deploy();
// TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2019"}' ts-node shared/deploy.ts
