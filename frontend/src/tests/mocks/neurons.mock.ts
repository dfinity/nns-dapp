import type { NeuronsStore } from "$lib/stores/neurons.store";
import type { TableNeuron } from "$lib/types/neurons-table";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import type {
  KnownNeuron,
  MaturityDisbursement,
  Neuron,
  NeuronInfo,
} from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

export const mockAccountIdentifier =
  "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32";

export const mockFullNeuron: Neuron = {
  id: 1n,
  stakedMaturityE8sEquivalent: undefined,
  controller: undefined,
  recentBallots: [],
  neuronType: undefined,
  kycVerified: true,
  notForProfit: false,
  cachedNeuronStake: 3_000_000_000n,
  createdTimestampSeconds: 10n,
  autoStakeMaturity: undefined,
  maturityE8sEquivalent: 10n,
  agingSinceTimestampSeconds: 10n,
  spawnAtTimesSeconds: undefined,
  neuronFees: 0n,
  hotKeys: [],
  accountIdentifier: mockAccountIdentifier,
  joinedCommunityFundTimestampSeconds: undefined,
  maturityDisbursementsInProgress: [],
  dissolveState: undefined,
  followees: [],
  visibility: undefined,
  votingPowerRefreshedTimestampSeconds: 0n,
  potentialVotingPower: 0n,
  decidingVotingPower: 0n,
};

export const mockMaturityDisbursement: MaturityDisbursement = {
  timestampOfDisbursementSeconds: 1_000_000_000n,
  amountE8s: 1_000_000n,
  accountToDisburseTo: undefined,
  // For the nns-dapp the accountIdentifierToDisburseTo field is used for non-main destinations,
  // instead of accountToDisburseTo.
  accountIdentifierToDisburseTo: mockAccountIdentifier,
  finalizeDisbursementTimestampSeconds: 1_000_000_000n,
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
  votingPowerRefreshedTimestampSeconds: 0n,
  decidingVotingPower: 0n,
  potentialVotingPower: 0n,
  neuronId: 1n,
  dissolveDelaySeconds: 11_111n,
  recentBallots: [],
  neuronType: undefined,
  createdTimestampSeconds: 10n,
  state: NeuronState.Locked,
  joinedCommunityFundTimestampSeconds: undefined,
  retrievedAtTimestampSeconds: 10n,
  /** @deprecated */
  votingPower: 300_000_000n,
  ageSeconds: 100n,
  visibility: undefined,
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
  id: 1_000n,
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

export const mockTableNeuron: TableNeuron = {
  domKey: "0",
  neuronId: "0",
  stake: TokenAmountV2.fromUlps({
    amount: 1n,
    token: ICPToken,
  }),
  stakeInUsd: 10,
  availableMaturity: 0n,
  stakedMaturity: 0n,
  dissolveDelaySeconds: 1n,
  state: NeuronState.Locked,
  tags: [],
  isPublic: undefined,
  voteDelegationState: "none",
};
