import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.5.2/index.ts";

Clarinet.test({
  name: "staking: stake DIKO tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall("staking", "stake", [
        types.uint(1000000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(1000000000);
  }
});
