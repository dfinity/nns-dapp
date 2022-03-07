// API calls with a scope wider than one canister:
// - calls that require multiple canisters.
// - calls that require additional systems such as hardware wallets.

import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  GovernanceCanister,
  ICP,
  LedgerCanister,
  NeuronInfo,
} from "@dfinity/nns";
import { get } from "svelte/store";
import type { NeuronId } from "../canisters/nns-dapp/nns-dapp.types";
import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { AuthStore, authStore } from "../stores/auth.store";
import { neuronsStore } from "../stores/neurons.store";
import { createAgent } from "../utils/agent.utils";

/**
 * Uses governance and ledger canisters to create a neuron and adds it to the store
 *
 * TODO: L2-322 Create neurons from subaccount
 */
export const stakeNeuron = async ({ stake }: { stake: ICP }): Promise<void> => {
  if (stake.toE8s() < E8S_PER_ICP) {
    throw new Error("Need a minimum of 1 ICP to stake a neuron");
  }

  const { canister, identity, agent } = await governanceCanister();

  const ledgerCanister: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  // TODO: L2-332 Get neuron information and add to store
  await canister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    ledgerCanister,
  });

  // TODO: Remove after L2-332
  await listNeurons();
};

// Gets neurons and adds them to the store
export const listNeurons = async (): Promise<void> => {
  const { canister, identity } = await governanceCanister();

  const neurons = await canister.getNeurons({
    certified: true,
    principal: identity.getPrincipal(),
  });
  neuronsStore.setNeurons(neurons);
};

export const getNeuron = async (
  neuronId: NeuronId
): Promise<NeuronInfo | undefined> => {
  const { canister, identity } = await governanceCanister();

  return canister.getNeuron({
    certified: true,
    principal: identity.getPrincipal(),
    neuronId,
  });
};

const governanceCanister = async (): Promise<{
  canister: GovernanceCanister;
  identity: Identity;
  agent: HttpAgent;
}> => {
  const { identity }: AuthStore = get(authStore);

  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity found listing neurons");
  }

  const agent: HttpAgent = await createAgent({
    identity,
    host: process.env.HOST,
  });

  return {
    canister: GovernanceCanister.create({
      agent,
      canisterId: GOVERNANCE_CANISTER_ID,
    }),
    identity,
    agent,
  };
};
