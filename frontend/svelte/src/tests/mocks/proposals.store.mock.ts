import type { ProposalInfo } from "@dfinity/nns";
import {
  EmptyResponse,
  GovernanceCanister,
  ICP,
  LedgerCanister,
  ListProposalsRequest,
  ListProposalsResponse,
  NeuronId,
  NeuronInfo,
  ProposalId,
  ProposalStatus,
  StakeNeuronError,
  Vote,
} from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import { neuronMock } from "./neurons.mock";

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

export const mockEmptyProposalsStoreSubscribe = (
  run: Subscriber<ProposalInfo[]>
): (() => void) => {
  run([]);

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

  public getProposal = async ({
    proposalId,
  }: {
    proposalId: any;
  }): Promise<ProposalInfo | undefined> => {
    return { id: BigInt(404) } as unknown as ProposalInfo;
  };

  public listNeurons = async ({
    certified,
    principal,
    neuronIds,
  }: {
    certified: boolean;
    principal: Principal;
    neuronIds?: bigint[] | undefined;
  }): Promise<NeuronInfo[]> => {
    return [
      {
        ...neuronMock,
      },
    ];
  };

  public getNeuron = async ({
    certified,
    principal,
    neuronId,
  }: {
    certified: boolean;
    principal: Principal;
    neuronId: NeuronId;
  }): Promise<NeuronInfo | undefined> => {
    return neuronMock;
  };

  public registerVote = async ({
    neuronId,
    vote,
    proposalId,
  }: {
    neuronId: NeuronId;
    vote: Vote;
    proposalId: ProposalId;
  }): Promise<EmptyResponse> => {
    return { Ok: null };
  };

  public stakeNeuron = async ({
    stake,
    principal,
    ledgerCanister,
  }: {
    stake: ICP;
    principal: Principal;
    ledgerCanister: LedgerCanister;
  }): Promise<NeuronId | StakeNeuronError> => {
    return neuronMock.neuronId;
  };
}
