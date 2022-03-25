import type { HttpAgent, Identity } from "@dfinity/agent";
import type { KnownNeuron, NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";
import { dfinityNeuron, icNeuron } from "./constants.api";
import { toSubAccountId } from "./utils.api";

export const queryNeuron = async ({
  neuronId,
  identity,
  certified,
}: {
  neuronId: NeuronId;
  identity: Identity;
  certified: boolean;
}): Promise<NeuronInfo | undefined> => {
  const { canister } = await governanceCanister({ identity });

  return canister.getNeuron({
    certified,
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

  return canister.setFollowees({
    neuronId,
    topic,
    followees,
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
 * Uses governance and ledger canisters to create a neuron
 */
export const stakeNeuron = async ({
  stake,
  identity,
  fromSubAccount,
}: {
  stake: ICP;
  identity: Identity;
  fromSubAccount?: SubAccountArray;
}): Promise<NeuronId> => {
  const { canister, agent } = await governanceCanister({ identity });

  const ledgerCanister: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  const fromSubAccountId =
    fromSubAccount !== undefined ? toSubAccountId(fromSubAccount) : undefined;

  return canister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    fromSubAccountId,
    ledgerCanister,
  });
};

export const queryKnownNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<KnownNeuron[]> => {
  const { canister } = await governanceCanister({ identity });

  const knownNeurons = await canister.listKnownNeurons(certified);

  if (!knownNeurons.find(({ id }) => id === dfinityNeuron.id)) {
    knownNeurons.push(dfinityNeuron);
  }

  if (!knownNeurons.find(({ id }) => id === icNeuron.id)) {
    knownNeurons.push(icNeuron);
  }

  return knownNeurons;
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
