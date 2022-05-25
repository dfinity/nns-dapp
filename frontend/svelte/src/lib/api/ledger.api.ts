import type { HttpAgent, Identity } from "@dfinity/agent";
import type { BlockHeight } from "@dfinity/nns";
import {
  AccountIdentifier,
  ICP,
  LedgerCanister,
  type Neuron,
} from "@dfinity/nns";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";

export const getNeuronBalance = async ({
  neuron,
  identity,
  certified,
}: {
  neuron: Neuron;
  identity: Identity;
  certified: boolean;
}): Promise<ICP> => {
  logWithTimestamp(`Getting Neuron Balance certified:${certified} call...`);
  const { canister } = await ledgerCanister({ identity });
  const response = await canister.accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(neuron.accountIdentifier),
    certified,
  });
  logWithTimestamp(`Getting Neuron Balance certified:${certified} complete.`);
  return response;
};

/**
 * Transfer ICP between accounts.
 *
 * @param {Object} params
 * @param {Identity} params.identity user identity
 * @param {string} params.to send ICP to destination address - an account identifier
 * @param {ICP} params.amount the amount to be transferred in ICP
 * @param {number | undefined} params.fromSubAccountId the optional subaccount id that would be the source of the transaction
 */
export const sendICP = async ({
  identity,
  to,
  amount,
  fromSubAccountId,
  memo,
}: {
  identity: Identity;
  to: string;
  amount: ICP;
  fromSubAccountId?: number | undefined;
  memo?: bigint;
}): Promise<BlockHeight> => {
  logWithTimestamp(`Sending icp call...`);
  const { canister } = await ledgerCanister({ identity });

  const response = await canister.transfer({
    to: AccountIdentifier.fromHex(to),
    amount,
    fromSubAccountId,
    memo,
  });
  logWithTimestamp(`Sending icp complete.`);
  return response;
};

const ledgerCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: LedgerCanister;
  agent: HttpAgent;
}> => {
  logWithTimestamp(`LC call...`);
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  logWithTimestamp(`LC complete.`);

  return {
    canister,
    agent,
  };
};
