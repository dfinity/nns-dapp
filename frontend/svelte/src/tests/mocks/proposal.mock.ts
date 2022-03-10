import type { ProposalInfo } from "@dfinity/nns";

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
