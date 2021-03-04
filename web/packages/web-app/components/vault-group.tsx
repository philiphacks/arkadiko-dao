import React from 'react';
import { Vault } from './vault';
import { getVaults } from '@common/get-vaults';

export const VaultGroup: React.FC = () => {
  const vaults = getVaults();

  return (
    <Vault />
  );
};
