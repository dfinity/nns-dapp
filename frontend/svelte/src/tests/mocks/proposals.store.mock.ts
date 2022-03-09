import type { ProposalInfo } from "@dfinity/nns";
import { ProposalStatus } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";

export const mockProposals: ProposalInfo[] = [
  {
    id: BigInt(404),
    proposal: {
      title: "Proposal1",
      summary:
        "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553",
    },
    status: ProposalStatus.PROPOSAL_STATUS_OPEN,
    ballots: [],
    proposer: BigInt(123456789),
  },
  {
    id: BigInt(303),
    proposal: {
      title: "Proposal2",
      summary:
        "Update the NNS subnet tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe in order to grant backup access to three backup pods operated by the DFINITY Foundation. The backup user has only read-only access to the recent blockchain artifacts.",
    },
    status: ProposalStatus.PROPOSAL_STATUS_EXECUTED,
    ballots: [],
    proposer: BigInt(987654321),
  },
] as unknown as ProposalInfo[];

export const mockProposalsStoreSubscribe = (
  run: Subscriber<ProposalInfo[]>
): (() => void) => {
  run(mockProposals);

  return () => {};
};

export const mockEmptyProposalsStoreSubscribe = (
  run: Subscriber<ProposalInfo[]>
): (() => void) => {
  run([]);

  return () => {};
};
