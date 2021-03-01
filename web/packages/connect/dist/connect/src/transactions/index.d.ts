import { ContractCallOptions, ContractDeployOptions, STXTransferOptions } from '../types/transactions';
export declare const makeContractCallToken: (options: ContractCallOptions) => Promise<string>;
export declare const makeContractDeployToken: (options: ContractDeployOptions) => Promise<string>;
export declare const makeSTXTransferToken: (options: STXTransferOptions) => Promise<string>;
export declare const openContractCall: (options: ContractCallOptions) => Promise<void>;
export declare const openContractDeploy: (options: ContractDeployOptions) => Promise<void>;
export declare const openSTXTransfer: (options: STXTransferOptions) => Promise<void>;
