import type { HttpAgent, Identity } from "@dfinity/agent";
import type { KnownNeuron, NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
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

  const response = await canister.increaseDissolveDelay({
    neuronId,
    additionalDissolveDelaySeconds: dissolveDelayInSeconds,
  });

  if ("Err" in response) {
    throw response.Err;
  }
};

export const setFollowees = async ({
  identity,
  neuronId,
  topic,
  followees,
}: {
  identity: Identity;
  neuronId: NeuronId;
  topic: Topic;
  followees: NeuronId[];
}): Promise<void> => {
  const { canister } = await governanceCanister({ identity });

  const response = await canister.setFollowees({
    neuronId,
    topic,
    followees,
  });

  if ("Err" in response) {
    throw response.Err;
  }
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

  const response = await canister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    ledgerCanister,
  });

  if (response instanceof StakeNeuronError) {
    throw response;
  }

  return response;
};

export const queryKnownNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<KnownNeuron[]> => {
  const { canister } = await governanceCanister({ identity });

  return canister.listKnownNeurons(certified);
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
  const agent = await createAgent({
    identity,
    host: process.env.HOST,
  });

  const canister = GovernanceCanister.create({
    agent,
    canisterId: GOVERNANCE_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
