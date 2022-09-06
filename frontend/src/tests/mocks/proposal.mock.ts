import { Vote, type Action, type ProposalInfo } from "@dfinity/nns";
import type { VoteRegistration } from "../../lib/stores/vote-registration.store";
import { deadlineTimestampSeconds } from "./proposals.store.mock";

/**
 * Generate mock proposals with autoincremented "id".
 * @param count How many proposals to create
 * @param fields Static fields to set to mock entries e.g. {proposalTimestampSeconds: BigInt(0)}
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
      } as unknown as ProposalInfo)
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
    amountE8s: BigInt(10000000),
    rewardMode: {
      RewardToNeuron: {
        dissolveDelaySeconds: BigInt(1000),
      },
    },
  },
} as Action;

export const proposalActionNnsFunction21 = {
  ExecuteNnsFunction: {
    nnsFunctionId: 21,
  },
} as Action;

// Not a valid `ProposalInfo` object. Only related to the test fields are included
export const mockProposalInfo: ProposalInfo = {
  id: BigInt(10000),
  proposal: {
    title: "title",
    url: "https://url.com",
    action: proposalActionMotion,
    summary: "summary-content",
  },
  proposer: BigInt(123),
  latestTally: {
    no: BigInt(400000000),
    yes: BigInt(600000000),
  },
  topic: 8,
  status: 2,
  rewardStatus: 3,
  ballots: [
    {
      neuronId: BigInt(0),
    },
  ],
  deadlineTimestampSeconds,
} as unknown as ProposalInfo;

export const mockVoteRegistration = {
  proposalInfo: { ...mockProposalInfo },
  neuronIds: [BigInt(0)],
  successfullyVotedNeuronIds: [],
  vote: Vote.NO,
  toastId: Symbol(),
  status: undefined,
} as VoteRegistration;
