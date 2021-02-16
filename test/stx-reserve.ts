import { Client, Provider, ProviderRegistry, Result } from "@blockstack/clarity";
import {
  // bufferCVFromString,
  // callReadOnlyFunction,
  // contractPrincipalCV,
  // cvToHex,
  // falseCV,
  // listCV,
  makeContractCall,
  // PostConditionMode,
  // someCV,
  // standardPrincipalCV,
  // trueCV,
  uintCV
} from "@stacks/transactions";
import { assert } from "chai";

describe("stacks reserve test suite", () => {
  let stxReserveClient: Client;
  let oracleClient: Client;
  let tokenClient: Client;
  let provider: Provider;

  const addresses = [
    "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "S02J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE",
    "SZ2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9H6DPR"
  ];
  const alice = addresses[0];
  const bob = addresses[1];
  const zoe = addresses[2];

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    stxReserveClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.stx-reserve", "stx-reserve", provider);
    oracleClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.oracle", "oracle", provider);
    tokenClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.arkadiko-token", "arkadiko-token", provider);
  });

  it("should have a valid syntax", async () => {
    await oracleClient.deployContract();
    await tokenClient.deployContract();
    await stxReserveClient.checkContract();
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await stxReserveClient.deployContract();
    });

    it("should mint 20 tokens through collateralize-and-mint", async () => {
      const value = 20;
      const tx = stxReserveClient.createTransaction({
        method: { name: "collateralize-and-mint", args: [`u${value}`, `'${alice}`] }
      })
      await tx.sign(alice);
      const receipt = await stxReserveClient.submitTransaction(tx);
      const result = Result.unwrap(receipt);

      // const query = stxReserveClient.createQuery({ method: { name: "collateralize-and-mint", args: [`u${value}`, `'${alice}`] } });
      // const receipt = await stxReserveClient.submitQuery(query);
      // const result = Result.unwrapUInt(receipt);
      assert.equal(result, 30);
    });
  });

  after(async () => {
    await provider.close();
  });
});
