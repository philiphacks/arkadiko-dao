import { Client, Provider, ProviderRegistry, Result, Transaction } from "@blockstack/clarity";
import {
  callReadOnlyFunction,
  StacksTransaction,
  uintCV,
  standardPrincipalCV
} from "@stacks/transactions";
import { assert } from "chai";
import { deployContract, callContractFunction } from "./utils";

describe("stacks reserve test suite", () => {
  let stxReserveClient: Client;
  let oracleClient: Client;
  let tokenClient: Client;
  let provider: Provider;

  const addresses = [
    "ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH"
  ];
  const alice = addresses[0];

  before(async () => {
    provider = await ProviderRegistry.createProvider();
    oracleClient = new Client("S1G2081040G2081040G2081040G208105NK8PE5.oracle", "oracle", provider);
    tokenClient = new Client("S1G2081040G2081040G2081040G208105NK8PE5.arkadiko-token", "arkadiko-token", provider);
    stxReserveClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.stx-reserve", "stx-reserve", provider);

    await deployContract('oracle');
    await deployContract('arkadiko-token');
    await deployContract('stx-reserve');
  });

  // it("should have a valid syntax", async () => {
  //   await stxReserveClient.checkContract();
  // });

  describe("deploying an instance of the contract", () => {
    it("should mint 5 tokens through collateralize-and-mint", async () => {
      const value = 5;
      console.log('Calling collateralize-and-mint function');
      const result = await callContractFunction(
        'stx-reserve',
        'collateralize-and-mint',
        [uintCV(value), standardPrincipalCV(alice)]
      );
      console.log(result);
      // await tx.sign(alice);

      // const result = handleTransaction(tx);
      // const receipt = await stxReserveClient.submitTransaction(tx);
      // const result = Result.unwrap(receipt);

      // assert.equal(result, 5);
    });
  });

  after(async () => {
    await provider.close();
  });
});
