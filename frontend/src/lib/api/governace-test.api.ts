import { GOVERNANCE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import type { Identity } from "@dfinity/agent";
import { GovernanceTestCanister, type Neuron } from "@dfinity/nns";
import { createAgent } from "./agent.api";

const governanceTestCanister = async (identity: Identity) => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  return GovernanceTestCanister.create({
    agent,
    canisterId: GOVERNANCE_CANISTER_ID,
  });
};

export const updateNeuron = async ({
  neuron,
  identity,
}: {
  neuron: Neuron;
  identity: Identity;
}): Promise<undefined> => {
  const canister = await governanceTestCanister(identity);

  await canister.updateNeuron(neuron);

  return;
};
