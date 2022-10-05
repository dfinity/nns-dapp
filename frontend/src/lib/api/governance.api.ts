import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { DFINITY_NEURON, IC_NEURON } from "$lib/constants/api.constants";
import { GOVERNANCE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { isLedgerIdentityProxy } from "$lib/proxy/ledger.services.proxy";
import { createAgent } from "$lib/utils/agent.utils";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import type {
  E8s,
  KnownNeuron,
  NeuronId,
  NeuronInfo,
  TokenAmount,
  Topic,
} from "@dfinity/nns";
import { GovernanceCanister } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { ledgerCanister as getLedgerCanister } from "./ledger.api";

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

export const leaveCommunityFund = async ({
  neuronId,
  identity,
}: {
  neuronId: NeuronId;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Leaving Community Fund (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  await canister.leaveCommunityFund(neuronId);
  logWithTimestamp(`Leaving Community Fund (${hashCode(neuronId)}) complete.`);
};

export const autoStakeMaturity = async ({
  neuronId,
  autoStake,
  identity,
}: {
  neuronId: NeuronId;
  autoStake: boolean;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(
    `${autoStake ? "Enable" : "Disable"} auto stake maturity (${hashCode(
      neuronId
    )}) call...`
  );

  const {
    canister: { autoStakeMaturity: autoStakeMaturityApi },
  } = await governanceCanister({ identity });

  await autoStakeMaturityApi({
    neuronId,
    autoStake,
  });

  logWithTimestamp(
    `${autoStake ? "Enable" : "Disable"} auto stake maturity (${hashCode(
      neuronId
    )}) complete.`
  );
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

export const stakeMaturity = async ({
  neuronId,
  percentageToStake,
  identity,
}: {
  neuronId: NeuronId;
  percentageToStake: number;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Stake maturity (${hashCode(neuronId)}) call...`);

  const {
    canister: { stakeMaturity: stakeMaturityApi },
  } = await governanceCanister({ identity });

  await stakeMaturityApi({ neuronId, percentageToStake });

  logWithTimestamp(`Stake maturity (${hashCode(neuronId)}) complete.`);
};

export const spawnNeuron = async ({
  neuronId,
  percentageToSpawn,
  identity,
}: {
  neuronId: NeuronId;
  // percentageToSpawn is not yet supported by the ledger IC app
  percentageToSpawn?: number;
  identity: Identity;
}): Promise<NeuronId> => {
  logWithTimestamp(`Spawn neuron (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  const newNeuronId = await canister.spawnNeuron({
    neuronId,
    percentageToSpawn,
  });
  logWithTimestamp(`Spawn neuron (${hashCode(neuronId)}) complete.`);
  return newNeuronId;
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
  amount: TokenAmount;
  identity: Identity;
}): Promise<NeuronId> => {
  logWithTimestamp(`Splitting Neuron (${hashCode(neuronId)}) call...`);
  const { canister } = await governanceCanister({ identity });

  const response = await canister.splitNeuron({
    neuronId,
    amount: amount.toE8s(),
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
  controller,
  ledgerCanisterIdentity,
  identity,
  fromSubAccount,
}: {
  stake: TokenAmount;
  controller: Principal;
  ledgerCanisterIdentity: Identity;
  identity: Identity;
  fromSubAccount?: SubAccountArray;
}): Promise<NeuronId> => {
  logWithTimestamp(`Staking Neuron call...`);
  const { canister } = await governanceCanister({ identity });

  // The use case of staking from Hardware wallet uses a different agent for governance and ledger canister.
  const { canister: ledgerCanister } = await getLedgerCanister({
    identity: ledgerCanisterIdentity,
  });

  const response = await canister.stakeNeuron({
    stake: stake.toE8s(),
    principal: controller,
    fromSubAccount,
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

  if (knownNeurons.find(({ id }) => id === DFINITY_NEURON.id) === undefined) {
    knownNeurons.push(DFINITY_NEURON);
  }

  if (knownNeurons.find(({ id }) => id === IC_NEURON.id) === undefined) {
    knownNeurons.push(IC_NEURON);
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
    hardwareWallet: await isLedgerIdentityProxy(identity),
  });

  return {
    canister,
    agent,
  };
};
