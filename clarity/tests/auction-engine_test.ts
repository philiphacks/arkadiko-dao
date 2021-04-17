import {
  Account,
  Chain,
  Clarinet,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.5.2/index.ts";

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

    call = await chain.callReadOnlyFn(
      "freddie",
      "get-vault-by-id",
      [types.uint(1)],
      wallet_1.address
    );
    let vault = call.result.expectTuple();
    vault['leftover-collateral'].expectUint(1379311);
    vault['is-liquidated'].expectBool(true);
    vault['auction-ended'].expectBool(true);
  }
});

Clarinet.test({
  name:
    "auction engine: bid on normal collateral auction with insufficient collateral to cover bad xUSD debt",
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
        types.uint(12), // 12 cents
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
    let minCollCall = await chain.callReadOnlyFn(
      "auction-engine",
      "calculate-minimum-collateral-amount",
      [types.uint(1)],
      wallet_1.address
    );
    minCollCall.result.expectOk().expectUint(100000000);
    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "bid", [
        types.uint(1),
        types.uint(0),
        types.uint(100000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // The auction sold off all of its collateral now, but not enough debt was raised
    // As a result, we will raise debt through a governance token auction
    let call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auction-by-id",
      [types.uint(1)],
      wallet_1.address
    );
    let auction = call.result.expectTuple();
    auction['total-collateral-sold'].expectUint(100000000);
    // TODO: chain.mineEmptyBlock(150); does not work
    for (let index = 0; index < 160; index++) {
      chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "close-auction", [
        types.uint(1)
      ], deployer.address)
    ]);
    call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auction-by-id",
      [types.uint(1)],
      wallet_1.address
    );
    auction = call.result.expectTuple();
    auction['is-open'].expectBool(false);
    const debtRaised = auction['total-debt-raised'].expectUint(100000000);
    const debtToRaise = auction['debt-to-raise'].expectUint(143000000);

    call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auction-by-id",
      [types.uint(2)],
      wallet_1.address
    );
    let dikoAuction = call.result.expectTuple();
    dikoAuction['collateral-token'].expectAscii('diko'); // auction off some gov token
    dikoAuction['debt-to-raise'].expectUint(debtToRaise - debtRaised); // raise the remainder of previous auction

    block = chain.mineBlock([
      Tx.contractCall("oracle", "update-price", [
        types.ascii("diko"),
        types.uint(200),
      ], deployer.address),
      Tx.contractCall("auction-engine", "bid", [
        types.uint(2),
        types.uint(0),
        types.uint(43000000)
      ], deployer.address)
    ]);
    block.receipts[1].result.expectOk().expectBool(true);

    call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auction-by-id",
      [types.uint(2)],
      wallet_1.address
    );
    dikoAuction = call.result.expectTuple();
    dikoAuction['is-open'].expectBool(false);

    call = await chain.callReadOnlyFn(
      "freddie",
      "get-vault-by-id",
      [types.uint(1)],
      wallet_1.address
    );
    let vault = call.result.expectTuple();
    vault['leftover-collateral'].expectUint(0);
    vault['is-liquidated'].expectBool(true);
    vault['auction-ended'].expectBool(true);
  }
});

Clarinet.test({
  name:
    "auction engine: auction ends without all collateral sold which should start new auction",
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
        types.principal(wallet_1.address),
        types.ascii("stx-a"),
        types.ascii("stx"),
        types.principal("STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stx-reserve"),
        types.principal("STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token"),
      ], wallet_1.address)
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
    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "bid", [
        types.uint(1),
        types.uint(0),
        types.uint(100000000)
      ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // 1 bid has been made and collateral is left.
    // Now image no bids come in for the 2nd lot.
    // Auction should end and a new one should be started
    for (let index = 0; index < 160; index++) {
      chain.mineBlock([]);
    }

    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "close-auction", [
        types.uint(1)
      ], deployer.address)
    ]);
    console.log(block.receipts[0]);
    let call = await chain.callReadOnlyFn(
      "auction-engine",
      "get-auction-by-id",
      [types.uint(1)],
      wallet_1.address
    );
    let auction = call.result.expectTuple();
    auction['is-open'].expectBool(true);
    // TODO: fix test
    // const debtRaised = auction['total-debt-raised'].expectUint(100000000);
    // const debtToRaise = auction['debt-to-raise'].expectUint(143000000);
  }
});

Clarinet.test({
  name:
    "auction engine: multiple bids on same lot - returns xUSD of losing bidder",
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
        types.principal(wallet_1.address),
        types.ascii("stx-a"),
        types.ascii("stx"),
        types.principal("STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.stx-reserve"),
        types.principal("STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.arkadiko-token"),
      ], wallet_1.address)
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
    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "bid", [
        types.uint(1),
        types.uint(0),
        types.uint(60000000)
      ], wallet_1.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    let call = await chain.callReadOnlyFn("xusd-token", "get-balance-of", [
      types.principal('STSTW15D618BSZQB85R058DS46THH86YQQY6XCB7.auction-engine'),
    ], deployer.address);
    call.result.expectOk().expectUint(60000000);

    call = await chain.callReadOnlyFn("xusd-token", "get-balance-of", [
      types.principal(wallet_1.address),
    ], deployer.address);
    call.result.expectOk().expectUint(70000000); // 130 - 60 = 70

    // place new bid higher than 60 (e.g. 100)
    block = chain.mineBlock([
      Tx.contractCall("auction-engine", "bid", [
        types.uint(1),
        types.uint(0),
        types.uint(100000000)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    call = await chain.callReadOnlyFn("xusd-token", "get-balance-of", [
      types.principal(wallet_1.address),
    ], deployer.address);
    call.result.expectOk().expectUint(130000000); // you get the 60 back since your bid got overruled
  }
});
