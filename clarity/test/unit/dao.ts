import { Client, Provider, ProviderRegistry } from "@blockstack/clarity";

describe("DAO unit test suite", () => {
  let daoClient: Client;
  let arkadikoToken: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    daoClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.dao", "dao", provider);
    arkadikoToken = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.arkadiko-token", "arkadiko-token", provider);
  });

  it("should have a valid syntax", async () => {
    await arkadikoToken.deployContract();
    await daoClient.checkContract();
  });

  after(async () => {
    await provider.close();
  });
});
