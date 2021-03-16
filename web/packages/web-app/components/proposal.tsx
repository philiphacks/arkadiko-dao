import React from 'react';
import { ProposalProps } from './proposal-group';


export const Proposal: React.FC<ProposalProps> = ({ id, proposer, forVotes, against, changes }) => {
  return (
    <div>
      <p>Proposal {id}</p>
      <p>Proposer: {proposer}</p>
      <p>Votes for: {forVotes}</p>
      <p>Votes against: {against}</p>
    </div>
  );
};
