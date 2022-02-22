import type { ProposalInfo } from "@dfinity/nns";

export const mockProposalInfo: ProposalInfo = {
  id: BigInt(10000),
  proposal: {
    title: "title",
    url: "url",
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: 4,
        nnsFunctionName: "nnsFunctionValue",
        payload: {
          data_source: '{"icp":["Binance"],"sdr":"fixer.io"}',
          timestamp_seconds: BigInt(200),
        },
        payloadBytes: new ArrayBuffer(0),
      },
    },
    summary: "summary",
  },
  proposer: BigInt(123),
  latestTally: {
    no: BigInt(400000000),
    yes: BigInt(600000000),
  },
  topic: 8,
  status: 2,
  rewardStatus: 3,
} as unknown as ProposalInfo;
