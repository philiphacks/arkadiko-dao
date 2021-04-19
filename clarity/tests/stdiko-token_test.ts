import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.5.2/index.ts";

Clarinet.test({
  name: "staked DIKO: stake DIKO tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall("stdiko-token", "stake", [
        types.uint(1000000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("stdiko-token", "get-balance-of", [
      types.principal(deployer.address),
    ], deployer.address);
    call.result.expectOk().expectUint(1000000000);

    call = await chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [
      types.principal(deployer.address),
    ], deployer.address);
    call.result.expectOk().expectUint(889000000000);

    call = await chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [
      types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stdiko-token'),
    ], deployer.address);
    call.result.expectOk().expectUint(1000000000);

    // test value of last-list-index
    // test list-ids
    // test staker-principals map
    call = await chain.callReadOnlyFn("stdiko-token", "get-staker-list", [
      types.uint(0)
    ], deployer.address);
  }
});

Clarinet.test({
  name: "staked DIKO: unstake DIKO tokens",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall("stdiko-token", "stake", [
        types.uint(1000000000)
      ], deployer.address)
    ]);
    block = chain.mineBlock([
      Tx.contractCall("stdiko-token", "unstake", [
        types.uint(1000000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = await chain.callReadOnlyFn("stdiko-token", "get-balance-of", [
      types.principal(deployer.address),
    ], deployer.address);
    call.result.expectOk().expectUint(0);

    call = await chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [
      types.principal(deployer.address),
    ], deployer.address);
    call.result.expectOk().expectUint(890000000000);

    call = await chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [
      types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stdiko-token'),
    ], deployer.address);
    call.result.expectOk().expectUint(0);
  }
});
