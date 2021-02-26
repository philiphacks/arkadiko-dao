import { Client, Provider, ProviderRegistry, Result, Transaction } from "@blockstack/clarity";
import { assert } from "chai";

describe("keeper registry unit test suite", () => {
  let keeperRegistryClient: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    keeperRegistryClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.keeper-registry", "keeper-registry", provider);
  });

  it("should have a valid syntax", async () => {
    await keeperRegistryClient.checkContract();
  });

  after(async () => {
    await provider.close();
  });
});
