import type { HttpAgent, Identity } from "@dfinity/agent";
import type { NeuronId, NeuronInfo } from "@dfinity/nns";
import {
  GovernanceCanister,
  ICP,
  LedgerCanister,
  StakeNeuronError,
} from "@dfinity/nns";
import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";

export const queryNeuron = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<NeuronInfo | undefined> => {
  const { canister } = await governanceCanister({ identity });

  return canister.getNeuron({
    certified: true,
    principal: identity.getPrincipal(),
    neuronId,
  });
};

export const increaseDissolveDelay = async ({
  neuronId,
  dissolveDelayInSeconds,
  identity,
}: {
  neuronId: NeuronId;
  dissolveDelayInSeconds: number;
  identity: Identity;
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  return canister.increaseDissolveDelay({
    neuronId,
    additionalDissolveDelaySeconds: dissolveDelayInSeconds,
  });
};

export const queryNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<NeuronInfo[]> => {
  const { canister } = await governanceCanister({ identity });

  return canister.listNeurons({
    certified,
    principal: identity.getPrincipal(),
  });
};

/**
 * Uses governance and ledger canisters to create a neuron and adds it to the store
 *
 * TODO: L2-322 Create neurons from subaccount
 */
export const stakeNeuron = async ({
  stake,
  identity,
}: {
  stake: ICP;
  identity: Identity;
}): Promise<NeuronId> => {
  const { canister, agent } = await governanceCanister({ identity });

  const ledgerCanister: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  return canister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    ledgerCanister,
  });
};

// TODO: Apply pattern to other canister instantiation L2-371
const governanceCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: GovernanceCanister;
  agent: HttpAgent;
}> => {
  const agent: HttpAgent = await createAgent({
    identity,
    host: process.env.HOST,
  });

  return {
    canister: GovernanceCanister.create({
      agent,
      canisterId: GOVERNANCE_CANISTER_ID,
    }),
    agent,
  };
};
