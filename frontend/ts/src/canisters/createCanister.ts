import LedgerService from './ledger/model';
import NnsDappService from './nnsDapp/model';
import NNS_DAPP_CANISTER_ID from './nnsDapp/canisterId';
import { CanisterIdString, E8s } from './common/types';
import * as convert from './converter';
import { CREATE_CANISTER_MEMO } from './constants';
import { pollUntilComplete } from './multiPartTransactionPollingHandler';
import { Principal } from '@dfinity/principal';

export type CreateCanisterRequest = {
  amount: E8s;
  fromSubAccountId?: number;
};

export type CreateCanisterResponse =
  | { created: CanisterIdString }
  | { error: { message: string; refunded: boolean } };

export async function createCanisterImpl(
  principal: Principal,
  ledgerService: LedgerService,
  nnsDappService: NnsDappService,
  request: CreateCanisterRequest
): Promise<CreateCanisterResponse> {
  const toSubAccount = convert.principalToSubAccount(principal);
  const recipient = convert.principalToAccountIdentifier(NNS_DAPP_CANISTER_ID, toSubAccount);
  const blockHeight = await ledgerService.sendICPTs({
    memo: CREATE_CANISTER_MEMO,
    amount: request.amount,
    to: recipient,
    fromSubAccountId: request.fromSubAccountId
  });

  const outcome = await pollUntilComplete(nnsDappService, principal, blockHeight);

  if ('CanisterCreated' in outcome) {
    return { created: outcome.CanisterCreated.toString() };
  } else if ('Refunded' in outcome) {
    return { error: { message: outcome.Refunded[1], refunded: true } };
  } else if ('Error' in outcome) {
    return { error: { message: outcome.Error, refunded: false } };
  } else {
    throw new Error('Unable to create canister');
  }
}
