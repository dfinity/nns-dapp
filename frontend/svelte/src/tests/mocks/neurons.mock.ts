import type { KnownNeuron, Neuron, NeuronInfo } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";
import type { NeuronsStore } from "../../lib/stores/neurons.store";
import { mockIdentity } from "./auth.store.mock";

export const mockFullNeuron: Neuron = {
  id: BigInt(1),
  controller: undefined,
  recentBallots: [],
  kycVerified: true,
  notForProfit: false,
  cachedNeuronStake: BigInt(3_000_000_000),
  createdTimestampSeconds: BigInt(10),
  maturityE8sEquivalent: BigInt(10),
  agingSinceTimestampSeconds: BigInt(10),
  neuronFees: BigInt(0),
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
  votingPower: BigInt(300_000_000),
  ageSeconds: BigInt(100),
  fullNeuron: mockFullNeuron,
};

export const mockKnownNeuron: KnownNeuron = {
  id: BigInt(1000),
  name: "Famous Neuron",
  description: undefined,
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
