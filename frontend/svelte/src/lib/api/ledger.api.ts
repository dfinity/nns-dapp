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
}: {
  neuron: Neuron;
  identity: Identity;
}): Promise<ICP> => {
  const { canister } = await ledgerCanister({ identity });
  // NOTE: We fetch the balance in an uncertified way as it's more efficient,
  // and a malicious actor wouldn't gain anything by spoofing this value in
  // this context.
  return canister.accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(neuron.accountIdentifier),
    certified: false,
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
