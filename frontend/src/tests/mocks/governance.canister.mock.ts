/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  LedgerCanister,
  ListProposalsRequest,
  ListProposalsResponse,
  NeuronId,
  NeuronInfo,
  ProposalInfo,
} from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { mockNeuron } from "./neurons.mock";

// eslint-disable-next-line
// @ts-ignore: test file
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
    if (request.limit === 1) {
      // mock getProposal call
      return {
        proposals: this.proposals.filter(
          ({ id }) => id === (request.beforeProposal as bigint) - BigInt(1)
        ),
      };
    }

    return {
      proposals: this.proposals,
    };
  };

  public getProposal = async ({
    proposalId,
  }: {
    proposalId: bigint;
  }): Promise<ProposalInfo | undefined> => {
    return this.proposals.find(({ id }) => id === proposalId);
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
        ...mockNeuron,
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
    return mockNeuron;
  };

  public registerVote = async ({
    neuronId,
    vote,
    proposalId,
  }: {
    neuronId: bigint;
    vote: Vote;
    proposalId: bigint;
  }) => {
    return;
  };

  public stakeNeuron = async ({
    stake,
    principal,
    ledgerCanister,
  }: {
    stake: bigint;
    principal: Principal;
    ledgerCanister: LedgerCanister;
  }): Promise<NeuronId> => {
    return mockNeuron.neuronId;
  };
}
