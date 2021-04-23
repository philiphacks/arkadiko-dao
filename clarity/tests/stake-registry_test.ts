import {
    Account,
    Chain,
    Clarinet,
    Tx,
    types,
} from "https://deno.land/x/clarinet@v0.6.0/index.ts";
  
Clarinet.test({
name: "stake-registry: add pool and get pool info",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Activate new pool
    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Get pool info
    let call = chain.callReadOnlyFn("stake-registry", "get-pool-contract", [types.uint(0)], wallet_1.address);
    call.result.expectTuple()['pool'].expectPrincipal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko');

    call = chain.callReadOnlyFn("stake-registry", "get-pool-data", [types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')], wallet_1.address);
    call.result.expectTuple()['name'].expectAscii('test-pool');
    call.result.expectTuple()['active'].expectBool(true);
}
});

Clarinet.test({
name: "stake-registry: can not add same pool twice",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Activate new pool
    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // We should not be able to activate the same pool again
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool-2'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(19002)

    // Get pool info
    let call = chain.callReadOnlyFn("stake-registry", "get-pool-contract", [types.uint(0)], wallet_1.address);
    call.result.expectTuple()['pool'].expectPrincipal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko');

    call = chain.callReadOnlyFn("stake-registry", "get-pool-data", [types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')], wallet_1.address);
    call.result.expectTuple()['name'].expectAscii('test-pool');
    call.result.expectTuple()['active'].expectBool(true);
}
});

Clarinet.test({
name: "stake-registry: stake and unstake",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Activate new pool
    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Check DIKO and stDIKO balance before staking
    let call = chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(150000000000);   
    call = chain.callReadOnlyFn("stake-pool-diko", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(0);   

    // Staked total
    call = chain.callReadOnlyFn("stake-pool-diko", "get-stake-amount-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectUint(0);
    call = chain.callReadOnlyFn("stake-pool-diko", "get-total-staked", [], wallet_1.address);
    call.result.expectUint(0);

    // Stake funds
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "stake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(100)
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(100);

    // Check DIKO and stDIKO balance after staking
    call = chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(149999999900);   
    call = chain.callReadOnlyFn("stake-pool-diko", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(100);   

    // Staked total
    call = chain.callReadOnlyFn("stake-pool-diko", "get-stake-amount-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectUint(100);
    call = chain.callReadOnlyFn("stake-pool-diko", "get-total-staked", [], wallet_1.address);
    call.result.expectUint(100);

    // Advance 3 block
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);

    // Advanced 3 blocks for user plus one in calculation, so 4000 
    call = chain.callReadOnlyFn("stake-pool-diko", "get-pending-rewards", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(4000);   

    // Unstake funds
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "unstake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(100)
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(100);

    // Check DIKO and stDIKO balance after unstaking. Should get initial deposit + rewards.
    call = chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(150000004000);  
    call = chain.callReadOnlyFn("stake-pool-diko", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(0);   

    // Staked total
    call = chain.callReadOnlyFn("stake-pool-diko", "get-stake-amount-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectUint(0);
    call = chain.callReadOnlyFn("stake-pool-diko", "get-total-staked", [], wallet_1.address);
    call.result.expectUint(0);
}
});

Clarinet.test({
name: "stake-registry: deactivate pool",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Activate new pool
    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Stake funds
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "stake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(100)
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(100);

    // Advance 3 block
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);

    // Deactivate pool
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "deactivate-pool", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Check DIKO and stDIKO balance before staking
    let call = chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(149999999900);   
    call = chain.callReadOnlyFn("stake-pool-diko", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(100);   

    // Advance 3 blocks
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);

    // We advanced 6 blocks in total, but pool was only active for 3 blocks.
    // Advanced 3 blocks for user plus one in calculation, so 4000 
    call = chain.callReadOnlyFn("stake-pool-diko", "get-pending-rewards", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(4000);   
    
    // User should still be able to claim rewards
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "claim-pending-rewards", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(4000);

    // Unstaking is still possible
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "unstake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(100)
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(100);
}
});

Clarinet.test({
name: "staking - Stake and calculate rewards",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Activate new pool
    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Cumm rewards should be 0
    let call = chain.callReadOnlyFn("stake-pool-diko", "get-cumm-reward-per-stake", [], wallet_1.address);
    call.result.expectUint(0);
    call = chain.callReadOnlyFn("stake-pool-diko", "calculate-cumm-reward-per-stake", [], wallet_1.address);
    call.result.expectUint(0);

    // Pending rewards should be 0
    call = chain.callReadOnlyFn("stake-pool-diko", "get-pending-rewards", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(0);

    // Initial stake should be 0
    call = chain.callReadOnlyFn("stake-pool-diko", "get-stake-amount-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectUint(0);
    call = chain.callReadOnlyFn("stake-pool-diko", "get-total-staked", [], wallet_1.address);
    call.result.expectUint(0);


    // Stake
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "stake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(100)
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(100);

    // New stake amounts = 100
    call = chain.callReadOnlyFn("stake-pool-diko", "get-stake-amount-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectUint(100);
    call = chain.callReadOnlyFn("stake-pool-diko", "get-total-staked", [], wallet_1.address);
    call.result.expectUint(100);

    // Advanced 2 blocks.  2 * (1000 / 100) = 20
    // Calculate function takes into account current rewards, so adds 1 block
    call = chain.callReadOnlyFn("stake-pool-diko", "get-cumm-reward-per-stake", [], wallet_1.address);
    call.result.expectUint(20);
    call = chain.callReadOnlyFn("stake-pool-diko", "calculate-cumm-reward-per-stake", [], wallet_1.address);
    call.result.expectUint(30);

    // Advanced 0 blocks for user. 
    // Pending rewards takes into account 1 block extra, so 1 * 1000
    call = chain.callReadOnlyFn("stake-pool-diko", "get-pending-rewards", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(1000);


    // Advance 3 blocks
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);

    // Total stake did not change, so cumm reward per stake should not change either
    call = chain.callReadOnlyFn("stake-pool-diko", "get-cumm-reward-per-stake", [], wallet_1.address);
    call.result.expectUint(20);

    // Advanced 5 blocks  5 * (1000 / 100) = 50
    // Calculate function takes into account current rewards, so adds 1 block
    call = chain.callReadOnlyFn("stake-pool-diko", "calculate-cumm-reward-per-stake", [], wallet_1.address);
    call.result.expectUint(60);

    // Advanced 3 blocks for user plus one in calculation, so 4000 
    call = chain.callReadOnlyFn("stake-pool-diko", "get-pending-rewards", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(4000);   
    
    // TODO: let wallet_2 stake and wallet_1 unstake 500 -> check rewards after 5 blocks
}
});

Clarinet.test({
name: "staking - Stake and claim rewards",
async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    // Activate new pool
    let block = chain.mineBlock([
    Tx.contractCall("stake-registry", "activate-pool", [
        types.ascii('test-pool'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
    ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Check initial user balance
    let call = chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(150000000000);   

    // Stake
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "stake", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko'),
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token'),
        types.uint(100)
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(100);

    // Advance 3 blocks
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);
    block = chain.mineBlock([ ]);

    // Advanced 3 blocks for user plus one in calculation, so 4000 
    call = chain.callReadOnlyFn("stake-pool-diko", "get-pending-rewards", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(4000);   
    
    // Claim
    block = chain.mineBlock([
    Tx.contractCall("stake-registry", "claim-pending-rewards", [
        types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stake-pool-diko')
    ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectUint(4000);

    // Check if user got rewards
    // 150000000000 initial - 100 invested + 4000 rewards
    call = chain.callReadOnlyFn("arkadiko-token", "get-balance-of", [types.principal(wallet_1.address)], wallet_1.address);
    call.result.expectOk().expectUint(150000003900);   
}
});
    