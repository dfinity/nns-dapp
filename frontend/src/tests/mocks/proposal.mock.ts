import type { VoteRegistrationStoreEntry } from "$lib/stores/vote-registration.store";
import { deadlineTimestampSeconds } from "$tests/mocks/proposals.store.mock";
import { Vote, type Action, type ProposalInfo } from "@dfinity/nns";

/**
 * Generate mock proposals with autoincremented "id".
 * @param count How many proposals to create
 * @param fields Static fields to set to mock entries e.g. {proposalTimestampSeconds: 0n}
 * @returns List of mock proposals (not fully set)
 */
export const generateMockProposals = (
  count: number,
  fields?: Partial<ProposalInfo>
): ProposalInfo[] =>
  Array.from(Array(count)).map(
    (_, index) =>
      ({
        ...fields,
        id: BigInt(index),
      }) as unknown as ProposalInfo
  );

export const proposalActionMotion = {
  Motion: {
    motionText: "Test motion",
  },
} as Action;

export const proposalActionRewardNodeProvider = {
  RewardNodeProvider: {
    nodeProvider: {
      id: "aaaaa-aa",
    },
    amountE8s: 10_000_000n,
    rewardMode: {
      RewardToNeuron: {
        dissolveDelaySeconds: 1_000n,
      },
    },
  },
} as Action;

export const proposalActionNnsFunction21 = {
  ExecuteNnsFunction: {
    nnsFunctionId: 21,
  },
} as Action;

export const proposalActionInstallCode = {
  InstallCode: {
    canisterId: "aaaaa-aa",
    wasmModuleHash: "abcd",
    argHash: "efgh",
    skipStoppingBeforeInstalling: false,
    installMode: 3,
  },
} as Action;

// Not a valid `ProposalInfo` object. Only related to the test fields are included
export const mockProposalInfo: ProposalInfo = {
  id: 10_000n,
  proposal: {
    title: "title",
    url: "https://url.com",
    action: proposalActionMotion,
    summary: "summary-content",
  },
  proposer: 123n,
  latestTally: {
    no: 400_000_000n,
    yes: 600_000_000n,
  },
  // TODO: Change this to 4 (Governance) to be consistent with the Motion type.
  topic: 8,
  status: 2,
  rewardStatus: 3,
  ballots: [
    {
      neuronId: 0n,
    },
  ],
  deadlineTimestampSeconds,
} as unknown as ProposalInfo;

export const createMockProposalInfo = ({ action }: { action: Action }) => ({
  ...mockProposalInfo,
  proposal: {
    ...mockProposalInfo.proposal,
    action,
  },
});

export const mockVoteRegistration = {
  proposalIdString: "10000",
  neuronIdStrings: ["1234567890"],
  successfullyVotedNeuronIdStrings: [],
  vote: Vote.No,
  status: "vote-registration",
} as VoteRegistrationStoreEntry;
