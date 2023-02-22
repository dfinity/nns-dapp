import { createAgent } from "$lib/api/agent.api";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "$lib/constants/constants";
import { HOST } from "$lib/constants/environment.constants";
import type { ProposalsFiltersStore } from "$lib/stores/proposals.store";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import { enumsExclude } from "$lib/utils/enum.utils";
import type { Identity } from "@dfinity/agent";
import type {
  ListProposalsResponse,
  NeuronId,
  ProposalId,
  ProposalInfo,
  Vote,
} from "@dfinity/nns";
import { GovernanceCanister, Topic } from "@dfinity/nns";
import { nnsDappCanister } from "./nns-dapp.api";

export const queryProposals = async ({
  beforeProposal,
  identity,
  filters,
  certified,
}: {
  beforeProposal: ProposalId | undefined;
  identity: Identity;
  filters: ProposalsFiltersStore;
  certified: boolean;
}): Promise<ProposalInfo[]> => {
  logWithTimestamp(
    `Querying Proposals (${
      beforeProposal === undefined ? "start" : hashCode(beforeProposal)
    }) certified:${certified} call...`
  );

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: HOST }),
  });

  const { rewards, status, topics }: ProposalsFiltersStore = filters;

  const { proposals }: ListProposalsResponse = await governance.listProposals({
    request: {
      limit: DEFAULT_LIST_PAGINATION_LIMIT,
      beforeProposal,
      excludeTopic: enumsExclude<Topic>({
        obj: Topic as unknown as Topic,
        values: topics,
      }),
      includeRewardStatus: rewards,
      includeStatus: status,
    },
    certified,
  });

  logWithTimestamp(
    `Querying Proposals (${
      beforeProposal === undefined ? "start" : hashCode(beforeProposal)
    }) certified:${certified} complete.`
  );

  return proposals;
};

/**
 * Fetch a proposal w/o the payload.
 */
export const queryProposal = async ({
  proposalId,
  identity,
  certified,
}: {
  proposalId: ProposalId;
  identity: Identity;
  certified: boolean;
}): Promise<ProposalInfo | undefined> => {
  logWithTimestamp(
    `Querying Proposal (${hashCode(proposalId)}) certified:${certified} call...`
  );

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: HOST }),
  });

  const response = await governance.listProposals({
    request: {
      limit: 1,
      beforeProposal: proposalId + BigInt(1),
      includeRewardStatus: [],
      excludeTopic: [],
      includeStatus: [],
    },
    certified,
  });

  logWithTimestamp(
    `Querying Proposal (${hashCode(
      proposalId
    )}) certified:${certified} complete.`
  );

  // `governance.listProposals` returns a random matching proposal for unknown proposal id that's why we test that the returned proposal id is the one we are looking for
  return response?.proposals?.[0].id === proposalId
    ? response.proposals[0]
    : undefined;
};

export const queryProposalPayload = async ({
  proposalId,
  identity,
}: {
  proposalId: ProposalId;
  identity: Identity;
}): Promise<object> => {
  logWithTimestamp(`Loading Proposal Payload ${hashCode(proposalId)} call...`);

  const { canister } = await nnsDappCanister({ identity });

  const response = await canister.getProposalPayload({
    proposalId,
  });

  logWithTimestamp(
    `Loading Proposal Payload ${hashCode(proposalId)} complete.`
  );

  return response;
};

export const registerVote = async ({
  neuronId,
  proposalId,
  vote,
  identity,
}: {
  neuronId: NeuronId;
  proposalId: ProposalId;
  vote: Vote;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(
    `Registering Vote (${hashCode(proposalId)}, ${hashCode(neuronId)}) call...`
  );

  const governance: GovernanceCanister = GovernanceCanister.create({
    agent: await createAgent({ identity, host: HOST }),
  });

  await governance.registerVote({
    neuronId,
    vote,
    proposalId,
  });

  logWithTimestamp(
    `Registering Vote (${hashCode(proposalId)}, ${hashCode(
      neuronId
    )}) complete.`
  );
};
