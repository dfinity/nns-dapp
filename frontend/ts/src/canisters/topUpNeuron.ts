import LedgerService from './ledger/model';
import NnsDappService from './nnsDapp/model';
import { AccountIdentifier, E8s } from './common/types';
import { pollUntilComplete } from './multiPartTransactionPollingHandler';
import { Principal } from '@dfinity/principal';

export type TopUpNeuronRequest = {
  amount: E8s;
  fromSubAccountId?: number;
  neuronAccountIdentifier: AccountIdentifier;
};

export default async function (
  principal: Principal,
  ledgerService: LedgerService,
  nnsDappService: NnsDappService,
  request: TopUpNeuronRequest
): Promise<void> {
  const blockHeight = await ledgerService.sendICPTs({
    amount: request.amount,
    to: request.neuronAccountIdentifier,
    fromSubAccountId: request.fromSubAccountId
  });

  const outcome = await pollUntilComplete(nnsDappService, principal, blockHeight);

  if (!('Complete' in outcome)) {
    throw new Error('Unable to top up neuron');
  }
}
