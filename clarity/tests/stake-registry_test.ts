import {
    Account,
    Chain,
    Clarinet,
    Tx,
    types,
  } from "https://deno.land/x/clarinet@v0.5.2/index.ts";
  
Clarinet.test({
name: "stake-registry: add pool and get all pool info,",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);

    let call = chain.callReadOnlyFn("stake-registry", "get-pool-contract", [types.uint(0)], wallet_1.address);
    call.result.expectTuple()['pool'].expectPrincipal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko');

    call = chain.callReadOnlyFn("stake-registry", "get-pool-data", [types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')], wallet_1.address);
    call.result.expectTuple()['name'].expectAscii('test-pool');
    call.result.expectTuple()['active'].expectBool(true);
}
});

Clarinet.test({
name: "stake-registry: deactivate pool,",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "deactivate-pool", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let call = chain.callReadOnlyFn("stake-registry", "get-pool-data", [types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')], wallet_1.address);
    call.result.expectTuple()['active'].expectBool(false);
}
});

Clarinet.test({
name: "staking - add pool + stake",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "stake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(1000000000)
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(1000000000);

    // let call = chain.callReadOnlyFn("stake-registry", "get-pool-data", [types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')], wallet_1.address);
    // call.result.expectTuple()['active'].expectBool(true);


}
});
