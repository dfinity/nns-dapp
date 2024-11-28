// services/dev.services.ts
import { Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '$lib/icputills/ledger.did';
import { idlFactoryB } from '$lib/icputills/bolt.did';


type TokenType = { 'ckBTC': null } | { 'ckETH': null } | { 'ICP': null } | { 'ckUSDC': null } | { 'GLDGov': null };

interface TransferArgs {
  token_type: TokenType;
  amount: bigint;
  toAccount: {
    owner: Principal;
    subaccount: number[];
  };
  order_id: number;
  merchant_name: string;
}

interface CanisterActor {
  transfer: (args: TransferArgs) => Promise<{ 'Ok': bigint } | { 'Err': string }>;
  getTransferStatus: (orderId: number) => Promise<any>;
}



interface TokenActor {
  icrc1_balance_of: (account: { owner: Principal; subaccount: number[] }) => Promise<bigint>;
  icrc2_allowance: (args: { account: { owner: Principal; subaccount: number[] }, spender: { owner: Principal; subaccount: number[] } }) => Promise<{ allowance: bigint }>;
  icrc2_approve: (args: any) => Promise<any>;
}


const APPROVAL_FEE = BigInt(40000);

export const parseTokenInput = (amount: string | number, tokenType: keyof TokenType): bigint => {
    // Check if amount is valid
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      throw new Error(`Invalid amount: ${amount}`);
    }
  
    // Convert to a number and scale by 10^6 (or another factor) to eliminate decimal places
    const scaledAmount = BigInt(Math.round(Number(amount) * 1e6)); // 1e6 is 10^6
  
    return scaledAmount;
  };
  

export const checkAllowanceAndTransfer = async (scanData: any) => {
    

  try {
 
   
    const tokenType = scanData.coin_name as keyof TokenType;
    
    const amount = parseTokenInput(scanData.amount, tokenType);
    
    // Dynamic approval fee based on token type
    let APPROVAL_FEE: bigint;
    switch (tokenType) {
      case 'ICP':
        APPROVAL_FEE = BigInt(40000);
        break;
      case 'ckETH':
        APPROVAL_FEE = BigInt(2 * 10 ** 18);
        break;
      case 'ckBTC':
        APPROVAL_FEE = BigInt(100);
        break;
      case 'ckUSDC':
        APPROVAL_FEE = BigInt(2_000_000_000_000);
        break;
      case 'GLDGov':
        APPROVAL_FEE = BigInt(100_000);
        break;
      default:
        throw new Error(`Unsupported token type: ${tokenType}`);
    }

    const totalApprovalAmount = amount + APPROVAL_FEE;
    console.log('Total approval amount (including fee):', totalApprovalAmount.toString());

    const canisterId = scanData.canister_id;

    if (!canisterId) {
      throw new Error(`Unsupported token type: ${tokenType}`);
    }
    
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    const agent = await HttpAgent.create({ identity, host: 'https://ic0.app' });
    await agent.fetchRootKey();

    // Approve
    const tokenActor = Actor.createActor<TokenActor>(idlFactory, {
      agent,
      canisterId,
    });
    const expirationTime = BigInt(Date.now() + 5 * 60 * 1000) * BigInt(1000000);

    console.log('Approving tokens...');
    const approveResult = await tokenActor.icrc2_approve({
      amount: BigInt(totalApprovalAmount),
      spender: { owner: Principal.fromText(scanData.blockbolt_canister_id), subaccount: [] },
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      expected_allowance: [],
      expires_at: [expirationTime],
    });
    
    console.log('Approve result:', approveResult);
    if ('Err' in approveResult) {
      throw new Error(`Approval failed: ${JSON.stringify(approveResult.Err)}`);
    }

    // Transfer
    const transferActor = Actor.createActor<CanisterActor>(idlFactoryB, {
      agent,
      canisterId: scanData.blockbolt_canister_id,
    });

    const transferArgs: TransferArgs = {
      token_type: { [tokenType]: null } as TokenType,
      amount: BigInt(amount),
      toAccount: {
        owner: Principal.fromText(scanData.merchant_address),
        subaccount: [],
      },
      order_id: scanData.order_id,
      merchant_name: scanData.merchant_name,
    };

    console.log('Initiating transfer...');
    const result = await transferActor.transfer(transferArgs);
    console.log('Transfer result:', result);

    if ('err' in result) {
      throw new Error(`Transfer failed: ${JSON.stringify(result.err)}`);
    }

    return result;

  } catch (error) {
    console.error('Error in handleTransaction:', error);
    throw error;
  } 
};