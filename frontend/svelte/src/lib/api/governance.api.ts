import type { HttpAgent, Identity } from "@dfinity/agent";
import type {
  E8s,
  KnownNeuron,
  NeuronId,
  NeuronInfo,
  Topic,
} from "@dfinity/nns";
import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";
import { hashCode, logWithTimestamp } from "../utils/dev.utils";
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
  logWithTimestamp(
    `Querying Neuron(${hashCode(neuronId)}) certified:${certified} call...`
  );
  const { canister } = await governanceCanister({ identity });

  const response = await canister.getNeuron({
    certified,
    neuronId,
  });
  logWithTimestamp(
    `Querying Neuron(${hashCode(neuronId)}) certified:${certified} complete.`
  );
  return response;
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
  logWithTimestamp(
    `Increasing Dissolve Delay(${hashCode(neuronId)}, ${hashCode(
      dissolveDelayInSeconds
    )}) call...`
  );
  const { canister } = await governanceCanister({ identity });

  await canister.increaseDissolveDelay({
    neuronId,
    additionalDissolveDelaySeconds: dissolveDelayInSeconds,
  });
  logWithTimestamp(
    `Increasing Dissolve Delay(${hashCode(neuronId)}, ${hashCode(
      dissolveDelayInSeconds
    )}) complete.`
  );
};

export const joinCommunityFund = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Joining Community Fund (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.joinCommunityFund(neuronId);
  logWithTimestamp(`Joining Community Fund (${hashCode(neuronId)}) complete.`);
};

export const disburse = async ({
  neuronId,
  toAccountId,
  amount,
  identity,
}: {
  neuronId: NeuronId;
  toAccountId?: string;
  amount?: E8s;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Disburse neuron (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.disburse({ neuronId, toAccountId, amount });
  logWithTimestamp(`Disburse neuron (${hashCode(neuronId)}) complete.`);
};

export const mergeMaturity = async ({
  neuronId,
  percentageToMerge,
  identity,
}: {
  neuronId: NeuronId;
  percentageToMerge: number;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Merge maturity (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.mergeMaturity({ neuronId, percentageToMerge });
  logWithTimestamp(`Merge maturity (${hashCode(neuronId)}) complete.`);
};

export const addHotkey = async ({
  neuronId,
  principal,
  identity,
}: {
  neuronId: NeuronId;
  principal: Principal;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Add hotkey (for neuron ${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.addHotkey({ neuronId, principal });
  logWithTimestamp(`Add hotkey (for neuron ${hashCode(neuronId)}) complete.`);
};

export const removeHotkey = async ({
  neuronId,
  principal,
  identity,
}: {
  neuronId: NeuronId;
  principal: Principal;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Remove hotkey (for neuron ${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.removeHotkey({ neuronId, principal });
  logWithTimestamp(
    `Remove hotkey (for neuron ${hashCode(neuronId)}) complete.`
  );
};

export const splitNeuron = async ({
  neuronId,
  amount,
  identity,
}: {
  neuronId: NeuronId;
  amount: ICP;
  identity: Identity;
}): Promise<NeuronId> => {
  logWithTimestamp(`Splitting Neuron (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  const response = await canister.splitNeuron({
    neuronId,
    amount,
  });
  logWithTimestamp(`Splitting Neuron (${hashCode(neuronId)}) complete.`);
  return response;
};

export const mergeNeurons = async ({
  sourceNeuronId,
  targetNeuronId,
  identity,
}: {
  sourceNeuronId: NeuronId;
  targetNeuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(
    `Merging neurons (${hashCode(sourceNeuronId)}, ${hashCode(
      targetNeuronId
    )}) call...`
  );
  const { canister } = await governanceCanister({ identity });

  await canister.mergeNeurons({
    sourceNeuronId,
    targetNeuronId,
  });
  logWithTimestamp(
    `Merging neurons (${hashCode(sourceNeuronId)}, ${hashCode(
      targetNeuronId
    )}) complete.`
  );
};

export const startDissolving = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Starting Dissolving (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.startDissolving(neuronId);
  logWithTimestamp(`Starting Dissolving (${hashCode(neuronId)}) complete.`);
};

export const stopDissolving = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Stopping Dissolving (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.stopDissolving(neuronId);
  logWithTimestamp(`Stopping Dissolving (${hashCode(neuronId)}) complete.`);
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
  logWithTimestamp(`Setting Followees (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.setFollowees({
    neuronId,
    topic,
    followees,
  });
  logWithTimestamp(`Setting Followees (${hashCode(neuronId)}) complete.`);
};

export const queryNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<NeuronInfo[]> => {
  logWithTimestamp(`Querying Neurons certified:${certified} call...`);
  const { canister } = await governanceCanister({ identity });

  const response = await canister.listNeurons({
    certified,
  });
  logWithTimestamp(`Querying Neurons certified:${certified} complete.`);
  return response;
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
  logWithTimestamp(`Staking Neuron call...`);
  const { canister, agent } = await governanceCanister({ identity });

  const ledgerCanister: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  const fromSubAccountId =
    fromSubAccount !== undefined ? toSubAccountId(fromSubAccount) : undefined;

  const response = await canister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    fromSubAccountId,
    ledgerCanister,
  });
  logWithTimestamp(`Staking Neuron complete.`);
  return response;
};

export const queryKnownNeurons = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<KnownNeuron[]> => {
  logWithTimestamp(`Querying Known Neurons certified:${certified} call...`);
  const { canister } = await governanceCanister({ identity });

  const knownNeurons = await canister.listKnownNeurons(certified);

  if (knownNeurons.find(({ id }) => id === dfinityNeuron.id) === undefined) {
    knownNeurons.push(dfinityNeuron);
  }

  if (knownNeurons.find(({ id }) => id === icNeuron.id) === undefined) {
    knownNeurons.push(icNeuron);
  }

  logWithTimestamp(`Querying Known Neurons certified:${certified} complete.`);
  return knownNeurons;
};

export const claimOrRefreshNeuron = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<NeuronId | undefined> => {
  logWithTimestamp(
    `ClaimingOrRefreshing Neurons (${hashCode(neuronId)}) call...`
  );
  const { canister } = await governanceCanister({ identity });

  const response = await canister.claimOrRefreshNeuron({
    neuronId,
    by: { NeuronIdOrSubaccount: {} },
  });
  logWithTimestamp(
    `ClaimingOrRefreshing Neurons (${hashCode(neuronId)}) complete.`
  );
  return response;
};

// TODO: Apply pattern to other canister instantiation L2-371
export const governanceCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: GovernanceCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
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
