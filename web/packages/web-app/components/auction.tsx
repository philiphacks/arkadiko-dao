import React, { useEffect, useState } from 'react';
import { AuctionProps} from './auction-group';
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';
import { stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';

export const Auction: React.FC<AuctionProps> = ({ id, ustx, price, debt, endsAt, setShowBidModal }) => {
  const [minimumCollateralAmount, setMinimumCollateralAmount] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const minimumBidAmount = () => {
    return ((ustx / 1000000) * (price / 100)).toFixed(2);
  }
  const stxAddress = useSTXAddress();

  useEffect(() => {
    let mounted = true;

    const getData = async () => {
      const minimumCollateralAmount = await callReadOnlyFunction({
        contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
        contractName: "auction-engine",
        functionName: "calculate-minimum-collateral-amount",
        functionArgs: [uintCV(id)],
        senderAddress: stxAddress || '',
        network: network,
      });

      const collJson = cvToJSON(minimumCollateralAmount);
      setMinimumCollateralAmount(collJson.value.value);

      const currentBid = await callReadOnlyFunction({
        contractAddress: 'ST31HHVBKYCYQQJ5AQ25ZHA6W2A548ZADDQ6S16GP',
        contractName: "auction-engine",
        functionName: "get-last-bid",
        functionArgs: [uintCV(id)],
        senderAddress: stxAddress || '',
        network: network,
      });

      const json = cvToJSON(currentBid);
      console.log(json);
      // setCurrentBid(json.value.value || 0);
      setCurrentBid(0);
    };

    if (mounted) {
      void getData();
    }

    return () => { mounted = false; }
  }, []);

  return (
    <tr className="bg-white">
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">
          {id}
        </span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">{minimumCollateralAmount / 10000} STX</span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">${price / 100}</span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">${(debt / 1000000).toFixed(2)}</span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">${minimumBidAmount()}</span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">${currentBid}</span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">{endsAt}</span>
      </td>
      <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">
          <button type="button" onClick={() => setShowBidModal(true)} className="px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Bid
          </button>
        </span>
      </td>
    </tr>
  );
};
