import type { ProposalInfo } from "@dfinity/nns";
import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";
import type { ProposalsStore } from "../../lib/stores/proposals.store";

export const deadlineTimestampSeconds = BigInt(
  Math.round(new Date().getTime() / 1000 + 10000)
);

export const mockProposals: ProposalInfo[] = [
  {
    id: BigInt(404),
    proposal: {
      title: "Proposal1",
      summary:
        "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553",
    },
    status: ProposalStatus.PROPOSAL_STATUS_OPEN,
    rewardStatus: ProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
    topic: Topic.Governance,
    ballots: [],
    proposer: BigInt(123456789),
    deadlineTimestampSeconds,
  },
  {
    id: BigInt(303),
    proposal: {
      title: "Proposal2",
      summary:
        "Update the NNS subnet tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe in order to grant backup access to three backup pods operated by the DFINITY Foundation. The backup user has only read-only access to the recent blockchain artifacts.",
    },
    status: ProposalStatus.PROPOSAL_STATUS_OPEN,
    rewardStatus: ProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
    topic: Topic.Governance,
    ballots: [],
    proposer: BigInt(987654321),
    deadlineTimestampSeconds,
  },
] as unknown as ProposalInfo[];

export const mockProposalsStoreSubscribe = (
  run: Subscriber<ProposalsStore>
): (() => void) => {
  run({ proposals: mockProposals, certified: true });

  return () => undefined;
};

export const mockEmptyProposalsStoreSubscribe = (
  run: Subscriber<ProposalsStore>
): (() => void) => {
  run({ proposals: [], certified: true });

  return () => undefined;
};
