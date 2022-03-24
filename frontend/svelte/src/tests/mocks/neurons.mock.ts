import type { KnownNeuron, Neuron, NeuronInfo } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";
import type { NeuronsStore } from "../../lib/stores/neurons.store";

export const mockFullNeuron: Neuron = {
  id: BigInt(1),
  isCurrentUserController: true,
  controller: undefined,
  recentBallots: [],
  kycVerified: true,
  notForProfit: false,
  cachedNeuronStake: BigInt(3_000_000_000),
  createdTimestampSeconds: BigInt(10),
  maturityE8sEquivalent: BigInt(10),
  agingSinceTimestampSeconds: BigInt(10),
  neuronFees: BigInt(10000000),
  hotKeys: [],
  accountIdentifier: "account-identifier-text",
  joinedCommunityFundTimestampSeconds: undefined,
  dissolveState: undefined,
  followees: [],
};

export const mockNeuron: NeuronInfo = {
  neuronId: BigInt(1),
  dissolveDelaySeconds: BigInt(11111),
  recentBallots: [],
  createdTimestampSeconds: BigInt(10),
  state: NeuronState.LOCKED,
  joinedCommunityFundTimestampSeconds: undefined,
  retrievedAtTimestampSeconds: BigInt(10),
  votingPower: BigInt(100),
  ageSeconds: BigInt(100),
  fullNeuron: mockFullNeuron,
};

export const mockKnownNeuron: KnownNeuron = {
  id: BigInt(1000),
  name: "Famous Neuron",
  description: undefined,
};

export const buildMockNeuronsStoreSubscribe =
  (neurons: NeuronInfo[] = []) =>
  (run: Subscriber<NeuronsStore>): (() => void) => {
    run(neurons);
    return () => undefined;
  };
