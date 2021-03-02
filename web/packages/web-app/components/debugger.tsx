import React, { useState } from 'react';
import { space, Box, Text, Button, ButtonGroup } from '@blockstack/ui';
import { getAuthOrigin, stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import BN from 'bn.js';
import {
  uintCV,
  intCV,
  bufferCV,
  broadcastTransaction,
  createStacksPrivateKey,
  stringAsciiCV,
  stringUtf8CV,
  standardPrincipalCV,
  trueCV,
  makeStandardSTXPostCondition,
  makeSTXTokenTransfer,
  FungibleConditionCode,
  privateKeyToString,
} from '@stacks/transactions';
import { ExplorerLink } from './explorer-link';

export const Debugger = () => {
  const { doContractCall, doSTXTransfer } = useConnect();
  const address = useSTXAddress();
  const [txId, setTxId] = useState<string>('');
  const [txType, setTxType] = useState<string>('');
  const env = process.env.REACT_APP_NETWORK_ENV;

  const clearState = () => {
    setTxId('');
    setTxType('');
  };

  const setState = (type: string, id: string) => {
    setTxId(id);
    setTxType(type);
  };

  const callCollateralizeAndMint = async () => {
    clearState();
    const authOrigin = getAuthOrigin();
    const args = [
      uintCV(1234),
      intCV(-234),
      bufferCV(Buffer.from('hello, world')),
      stringAsciiCV('hey-ascii'),
      stringUtf8CV('hey-utf8'),
      standardPrincipalCV('STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6'),
      trueCV(),
    ];
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
      contractName: 'faker',
      functionName: 'rawr',
      functionArgs: args,
      postConditions: [
        makeStandardSTXPostCondition(
          address || '',
          FungibleConditionCode.LessEqual,
          new BN('100', 10)
        ),
      ],
      finished: data => {
        console.log('finished faker!', data);
        console.log(data.stacksTransaction.auth.spendingCondition?.nonce.toNumber());
        setState('Contract Call', data.txId);
      },
    });
  };

  const stxTransfer = async (amount: string) => {
    clearState();
    const authOrigin = getAuthOrigin();
    await doSTXTransfer({
      network,
      authOrigin,
      amount,
      memo: 'From demo app',
      recipient: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
      finished: data => {
        console.log('finished stx transfer!', data);
        setState('Stacks Transfer', data.txId);
      },
    });
  };

  const addMocknetStx = async () => {
    clearState();
    const key = '9aef533e754663a453984b69d36f109be817e9940519cc84979419e2be00864801';
    const senderKey = createStacksPrivateKey(key);
    console.log('Adding STX from mocknet address to', address, 'on network', network);

    const transaction = await makeSTXTokenTransfer({
      recipient: standardPrincipalCV(address || ''),
      amount: new BN(10000000),
      senderKey: privateKeyToString(senderKey),
      network: network
    });
    console.log(transaction);
    const result = await broadcastTransaction(transaction, network);
    console.log(result);
  }

  const getFaucetTokens = async () => {
    clearState();
    const authOrigin = getAuthOrigin();
    await doContractCall({
      network,
      authOrigin,
      contractAddress: 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
      contractName: 'connect-token',
      functionName: 'faucet',
      functionArgs: [],
      finished: data => {
        console.log('finished faucet!', data);
        setState('Token Faucet', data.txId);
      },
    });
  };
  return (
    <Box py={6}>
      <Text as="h2" textStyle="display.small">
        Mint and Burn
      </Text>
      <Text textStyle="body.large" display="block">
        Mint some stablecoin using uSTX, or burn them all
      </Text>
      <ExplorerLink
        txId="ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH.stx-reserve"
        text="View contract in explorer"
        skipConfirmCheck
      />
      {txId && (
        <Text textStyle="body.large" display="block" my={space('base')}>
          <Text color="green" fontSize={1}>
            Successfully broadcasted &quot;{txType}&quot;
          </Text>
          <ExplorerLink txId={txId} />
        </Text>
      )}

      <Box>
        <ButtonGroup spacing={4} my="base">
          <Button mt={3} onClick={callCollateralizeAndMint}>
            Mint Stablecoin w/ 10 STX
          </Button>
          <Button mt={3} onClick={() => stxTransfer('102')}>
            Burn Stablecoin in Vault
          </Button>
          {env == 'mocknet' ? (
            <Button mt={3} onClick={() => addMocknetStx()}>
              Get tokens from mocknet
            </Button>
          ) : (
            <Button mt={3} onClick={() => addMocknetStx()}>
              Drain the faucet on testnet
            </Button>
          )}
        </ButtonGroup>
      </Box>
    </Box>
  );
};
