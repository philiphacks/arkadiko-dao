import { Client, Provider, ProviderRegistry, Result, Transaction } from "@blockstack/clarity";
import { assert } from "chai";

describe("auction engine unit test suite", () => {
  let auctionEngineClient: Client;
  let oracleClient: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    oracleClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.oracle", "oracle", provider);
    auctionEngineClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.auction-engine", "auction-engine", provider);
  });

  it("should have a valid syntax", async () => {
    await oracleClient.deployContract();
    await auctionEngineClient.checkContract();
  });

  after(async () => {
    await provider.close();
  });
});
