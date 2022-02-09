import type { ProposalInfo } from "@dfinity/nns";
import {
  GovernanceCanister,
  ListProposalsRequest,
  ListProposalsResponse,
  ProposalStatus,
} from "@dfinity/nns";
import type { Subscriber } from "svelte/store";

const mockProposals: ProposalInfo[] = [
  {
    id: "test1",
    title: "Proposal1",
    status: ProposalStatus.PROPOSAL_STATUS_OPEN,
  },
  {
    id: "test2",
    title: "Proposal2",
    status: ProposalStatus.PROPOSAL_STATUS_EXECUTED,
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
}
