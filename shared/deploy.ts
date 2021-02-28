import { deployContract } from "./utils";

export async function deploy() {
  await deployContract("arkadiko-token");
  await deployContract("oracle");
  await deployContract("stx-reserve");
};

deploy();
// TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","target":"es2019"}' ts-node shared/deploy.ts
