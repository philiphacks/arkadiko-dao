import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.5.2/index.ts";
import { assert } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name:
    "auction engine: bid on normal collateral auction with enough collateral to cover bad xUSD debt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      // Initialize price of STX to $2 in the oracle
      Tx.contractCall("oracle", "update-price", [
        types.ascii("stx"),
        types.uint(200),
      ], deployer.address),
      Tx.contractCall("freddie", "collateralize-and-mint", [
        types.uint(100000000), // 100 STX
        types.uint(130000000), // mint 130 xUSD
        types.principal(deployer.address),
        types.ascii("stx-a"),
        types.ascii("stx"),
        types.principal("STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stx-reserve"),
        types.principal("STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token"),
      ], deployer.address)
    ]);
    block.receipts[1].result
      .expectOk()
      .expectUint(130000000);

    block = chain.mineBlock([
      Tx.contractCall("oracle", "update-price", [
        types.ascii("stx"),
        types.uint(150),
      ], deployer.address),
      Tx.contractCall("liquidator", "notify-risky-vault", [
        types.uint(1),
      ], deployer.address),
    ]);
    block.receipts[1].result
      .expectOk()
      .expectUint(5200);

    // Now the liquidation started and an auction should have been created!
    // Make a bid on the first 100 xUSD
    let call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auctions",
      [],
      wallet_1.address,
    );
    let auctions = call.result
      .expectOk()
      .expectList()
      .map((e: String) => e.expectTuple());

    let auction = auctions[1];
    auction['collateral-amount'].expectUint(100000000);
    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "bid", [
        types.uint(1),
        types.uint(0),
        types.uint(100000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    let lastBidCall = await chain.callReadOnlyFn(
      "auction-engine",
      "get-last-bid",
      [types.uint(1), types.uint(0)],
      wallet_1.address
    );
    let lastBid = lastBidCall.result.expectTuple();
    lastBid['is-accepted'].expectBool(true);
    lastBid['xusd'].expectUint(100000000);

    let minCollCall = await chain.callReadOnlyFn(
      "auction-engine",
      "calculate-minimum-collateral-amount",
      [types.uint(1)],
      wallet_1.address
    );
    minCollCall.result.expectOk().expectUint(29655172);

    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "bid", [
        types.uint(1),
        types.uint(1),
        types.uint(44482758) // 1.5 (price of STX) * minimum collateral
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auction-by-id",
      [types.uint(1)],
      wallet_1.address,
    );
    auction = call.result.expectTuple();
    auction['is-open'].expectBool(false);
  }
});
