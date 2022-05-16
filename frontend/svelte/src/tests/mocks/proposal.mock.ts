import type { ProposalInfo } from "@dfinity/nns";

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

// Not a valid `ProposalInfo` object. Only related to the test fields are included
export const mockProposalInfo: ProposalInfo = {
  id: BigInt(10000),
  proposal: {
    title: "title",
    url: "url",
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: 4,
        nodeProvider: { name: "Provider" },
        nnsFunctionName: "nnsFunctionValue",
        payload: {
          data_source: '{"icp":["Binance"],"sdr":"fixer.io"}',
          timestamp_seconds: BigInt(200),
        },
        payloadBytes: new ArrayBuffer(0),
      },
    },
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
} as unknown as ProposalInfo;
