import { Neuron, NeuronInfo, NeuronState } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";
import type { NeuronsStore } from "../../lib/stores/neurons.store";

export const fullNeuronMock: Neuron = {
  id: BigInt(1),
  isCurrentUserController: true,
  controller: undefined,
  recentBallots: [],
  kycVerified: true,
  notForProfit: false,
  cachedNeuronStake: BigInt(100000000),
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

export const neuronMock: NeuronInfo = {
  neuronId: BigInt(1),
  dissolveDelaySeconds: BigInt(11111),
  recentBallots: [],
  createdTimestampSeconds: BigInt(10),
  state: NeuronState.LOCKED,
  joinedCommunityFundTimestampSeconds: undefined,
  retrievedAtTimestampSeconds: BigInt(10),
  votingPower: BigInt(100),
  ageSeconds: BigInt(100),
  fullNeuron: fullNeuronMock,
};

export const buildMockNeuronsStoreSubscibe =
  (neurons: NeuronInfo[] = []) =>
  (run: Subscriber<NeuronsStore>): (() => void) => {
    run(neurons);
    return () => undefined;
  };
