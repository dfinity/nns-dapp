import type { NeuronsStore } from "$lib/stores/neurons.store";
import type { KnownNeuron, Neuron, NeuronInfo } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";
import { mockIdentity } from "./auth.store.mock";

export const mockFullNeuron: Neuron = {
  id: BigInt(1),
  stakedMaturityE8sEquivalent: undefined,
  controller: undefined,
  recentBallots: [],
  neuronType: undefined,
  kycVerified: true,
  notForProfit: false,
  cachedNeuronStake: BigInt(3_000_000_000),
  createdTimestampSeconds: BigInt(10),
  autoStakeMaturity: undefined,
  maturityE8sEquivalent: BigInt(10),
  agingSinceTimestampSeconds: BigInt(10),
  spawnAtTimesSeconds: undefined,
  neuronFees: BigInt(0),
  hotKeys: [],
  accountIdentifier:
    "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
  joinedCommunityFundTimestampSeconds: undefined,
  dissolveState: undefined,
  followees: [],
};

export const createMockFullNeuron = (id: number | bigint) => {
  if (typeof id === "number") {
    id = BigInt(id);
  }
  return {
    ...mockFullNeuron,
    neuronId: id,
  } as Neuron;
};

export const mockNeuron: NeuronInfo = {
  neuronId: BigInt(1),
  dissolveDelaySeconds: BigInt(11111),
  recentBallots: [],
  neuronType: undefined,
  createdTimestampSeconds: BigInt(10),
  state: NeuronState.Locked,
  joinedCommunityFundTimestampSeconds: undefined,
  retrievedAtTimestampSeconds: BigInt(10),
  votingPower: BigInt(300_000_000),
  ageSeconds: BigInt(100),
  fullNeuron: mockFullNeuron,
};

export const createMockNeuron = (id: number | bigint) => {
  if (typeof id === "number") {
    id = BigInt(id);
  }
  return {
    ...mockNeuron,
    neuronId: id,
    fullNeuron: createMockFullNeuron(id),
  } as NeuronInfo;
};

export const mockKnownNeuron: KnownNeuron = {
  id: BigInt(1000),
  name: "Famous Neuron",
  description: undefined,
};

export const createMockKnownNeuron = (id: number | bigint) => {
  if (typeof id === "number") {
    id = BigInt(id);
  }
  return {
    ...mockKnownNeuron,
    id,
  } as KnownNeuron;
};

export const buildMockNeuronsStoreSubscribe =
  (neurons: NeuronInfo[] = [], certified = true) =>
  (run: Subscriber<NeuronsStore>): (() => void) => {
    run({ neurons, certified });
    return () => undefined;
  };

export const mockNeuronControlled = {
  ...mockNeuron,
  fullNeuron: {
    ...mockFullNeuron,
    hotKeys: [mockIdentity.getPrincipal().toText()],
  },
};

export const mockNeuronNotControlled = {
  ...mockNeuron,
  fullNeuron: {
    ...mockFullNeuron,
    hotKeys: ["not-current-principal"],
  },
};
