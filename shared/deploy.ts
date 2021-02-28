import { deployContract } from "./utils";

export async function deploy() {
  await deployContract('vault-trait');
  await deployContract('oracle');
  await deployContract('arkadiko-token');
  await deployContract('stx-reserve');

  await deployContract('liquidator');
  await deployContract('stacker-registry');
  await deployContract('auction-engine');
};

deploy();
// TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2019"}' ts-node shared/deploy.ts
