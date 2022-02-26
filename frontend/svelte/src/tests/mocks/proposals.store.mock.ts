import type { ProposalInfo } from "@dfinity/nns";
import {
  GovernanceCanister,
  ListProposalsRequest,
  ListProposalsResponse,
  ProposalStatus,
} from "@dfinity/nns";
import type { Subscriber } from "svelte/store";

export const mockProposals: ProposalInfo[] = [
  {
    id: "test1",
    proposal: {
      title: "Proposal1",
    },
    status: ProposalStatus.PROPOSAL_STATUS_OPEN,
    ballots: [],
    proposer: BigInt(123456789),
  },
  {
    id: "test2",
    proposal: {
      title: "Proposal2",
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

// @ts-ignore
export class MockGovernanceCanister extends GovernanceCanister {
  constructor(private proposals: ProposalInfo[]) {
    super();
  }

  create() {
    return this;
  }

  public listProposals = async ({
    request,
    certified = true,
  }: {
    request: ListProposalsRequest;
    certified?: boolean;
  }): Promise<ListProposalsResponse> => {
    return {
      proposals: this.proposals,
    };
  };

  public getProposalInfo = async ({
    proposalId,
  }: {
    proposalId: any;
  }): Promise<ProposalInfo | undefined> => {
    return { id: BigInt(404) } as unknown as ProposalInfo;
  };
}
