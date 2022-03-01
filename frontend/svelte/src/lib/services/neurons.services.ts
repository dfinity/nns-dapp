// API calls with a scope wider than one canister:
// - calls that require multiple canisters.
// - calls that require additional systems such as hardware wallets.

import {
  GovernanceCanister,
  ICP,
  LedgerCanister,
  NeuronInfo,
} from "@dfinity/nns";
import { get } from "svelte/store";
import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "../constants/canister-ids.constants";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { AuthStore, authStore } from "../stores/auth.store";
import { createAgent } from "../utils/agent.utils";

/**
 * Uses governance and ledger canisters to create a neuron.
 *
 * TODO: L2-322 Create neurons from subaccount
 */
export const stakeNeuron = async ({ stake }: { stake: ICP }): Promise<void> => {
  if (stake.toE8s() < E8S_PER_ICP) {
    throw new Error("Need a minimum of 1 ICP to stake a neuron");
  }
  const { identity }: AuthStore = get(authStore);
  const agent = await createAgent({ identity, host: process.env.HOST });
  const governanceCanister: GovernanceCanister = GovernanceCanister.create({
    agent,
    canisterId: GOVERNANCE_CANISTER_ID,
  });
  const ledgerCanister: LedgerCanister = LedgerCanister.create({
    agent,
    canisterId: LEDGER_CANISTER_ID,
  });

  await governanceCanister.stakeNeuron({
    stake,
    principal: identity.getPrincipal(),
    ledgerCanister,
  });
};

export const getNeurons = async (): Promise<NeuronInfo[]> => {
  // TODO: Implement to be used and test L2-313
  const { identity }: AuthStore = get(authStore);
  const agent = await createAgent({ identity, host: process.env.HOST });
  const governanceCanister: GovernanceCanister = GovernanceCanister.create({
    agent,
    canisterId: GOVERNANCE_CANISTER_ID,
  });
  return governanceCanister.getNeurons({
    certified: true,
    principal: identity.getPrincipal(),
  });
};
