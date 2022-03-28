import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  AccountIdentifier,
  LedgerCanister,
  type ICP,
  type Neuron,
} from "@dfinity/nns";
import { LEDGER_CANISTER_ID } from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";

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
