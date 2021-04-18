import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.5.2/index.ts";

Clarinet.test({
  name: "diko-staker: stake DIKO",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall("diko-staker", "stake", [
        types.principal(deployer.address),
        types.uint(1000000000)
      ], deployer.address)
    ]);

    console.log(block.receipts);
  }
});
