import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.6.0/index.ts";

Clarinet.test({
  name: "governance: test",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Get 
    let call = chain.callReadOnlyFn("governance", "get-proposal-ids", [], wallet_1.address);
    call.result.expectOk().expectList();
    
    // Create proposal
    let block = chain.mineBlock([
    Tx.contractCall("governance", "propose", [
        types.uint(10),
        types.utf8("test details")
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Get 
    call = chain.callReadOnlyFn("governance", "get-proposal-ids", [], wallet_1.address);
    call.result.expectOk().expectList();

    call = chain.callReadOnlyFn("governance", "get-proposal-by-id", [types.uint(1)], wallet_1.address);
    call.result.expectTuple()["details"].expectUtf8("test details");
    call.result.expectTuple()["is-open"].expectBool(true);
    call.result.expectTuple()["start-block-height"].expectUint(10);
    call.result.expectTuple()["yes-votes"].expectUint(0);
    call.result.expectTuple()["no-votes"].expectUint(0);


  }
});
