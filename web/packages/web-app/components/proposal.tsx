import React from 'react';
import { ProposalProps } from './proposal-group';

export const Proposal: React.FC<ProposalProps> = ({ id, proposer, forVotes, token, against, changes }) => {
  return (
    <div>
      <p>Proposal #{id} on token {token.toUpperCase()}</p>
      <p>Proposer: {proposer}</p>
      <p></p>
      <p>Votes for: {forVotes}</p>
      <p>Votes against: {against}</p>
    </div>
  );
};
