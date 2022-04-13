import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  AccountIdentifier,
  ICP,
  LedgerCanister,
  type Neuron,
} from "@dfinity/nns";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";
import type {BlockHeight} from '@dfinity/nns';

export const getNeuronBalance = async ({
  neuron,
  identity,
  certified,
}: {
  neuron: Neuron;
  identity: Identity;
  certified: boolean;
}): Promise<ICP> => {
  const { canister } = await ledgerCanister({ identity });
  return canister.accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(neuron.accountIdentifier),
    certified,
  });
};

/**
 * Transfer ICP between accounts.
 *
 * @param to: send ICP to destination address - an account identifier
 * @param identity
 * @param amount
 * @param fromSubAccountId
 */
export const sendICP = async ({
  identity,
  to,
  amount,
  fromSubAccountId,
}: {
  identity: Identity;
  to: string;
  amount: ICP;
  fromSubAccountId?: number | undefined;
}): Promise<BlockHeight> => {
  const { canister } = await ledgerCanister({ identity });

  return canister.transfer({
    to: AccountIdentifier.fromHex(to),
    amount,
    fromSubAccountId,
  });
};

const ledgerCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: LedgerCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: process.env.HOST,
  });

  const canister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
