import {
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import type { NetworkEconomics } from "@dfinity/nns";

export const mockNetworkEconomics: NetworkEconomics = {
  neuronMinimumStake: 100_000_000n,
  maxProposalsToKeepPerTopic: 1_000,
  neuronManagementFeePerProposal: 10_000n,
  rejectCost: 10_000_000n,
  transactionFee: 1_000n,
  neuronSpawnDissolveDelaySeconds: 3600n * 24n * 7n,
  minimumIcpXdrRate: 1n,
  maximumNodeProviderRewards: 10_000_000_000n,
  neuronsFundEconomics: {
    minimumIcpXdrRate: {
      basisPoints: 123n,
    },
    maxTheoreticalNeuronsFundParticipationAmountXdr: {
      humanReadable: "456",
    },
    neuronsFundMatchedFundingCurveCoefficients: {
      contributionThresholdXdr: {
        humanReadable: "789",
      },
      oneThirdParticipationMilestoneXdr: {
        humanReadable: "123",
      },
      fullParticipationMilestoneXdr: {
        humanReadable: "456",
      },
    },
    maximumIcpXdrRate: {
      basisPoints: 456n,
    },
  },
  votingPowerEconomics: {
    startReducingVotingPowerAfterSeconds: BigInt(SECONDS_IN_HALF_YEAR),
    clearFollowingAfterSeconds: BigInt(SECONDS_IN_MONTH),
  },
};
