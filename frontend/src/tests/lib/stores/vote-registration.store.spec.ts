import type { ProposalId } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  voteRegistrationStore,
  type VoteRegistration,
} from "../../../lib/stores/vote-registration.store";
import {
  mockProposalInfo,
  mockVoteRegistration,
} from "../../mocks/proposal.mock";

describe("voting-store", () => {
  const voteA: VoteRegistration = {
    ...mockVoteRegistration,
    proposalInfo: {
      ...mockProposalInfo,
      id: BigInt(1),
    },
  };
  const voteB: VoteRegistration = {
    ...mockVoteRegistration,
    proposalInfo: {
      ...mockProposalInfo,
      id: BigInt(2),
    },
  };
  const createArgs = ({
    vote,
    proposalInfo,
    neuronIds,
    toastId,
  }: VoteRegistration) => ({
    vote,
    proposalInfo,
    neuronIds,
    toastId,
  });

  afterEach(() => {
    voteRegistrationStore.reset();
  });

  it("should set voting items", () => {
    voteRegistrationStore.create(createArgs(voteA));

    expect(get(voteRegistrationStore)).toEqual({ registrations: [voteA] });

    voteRegistrationStore.create(createArgs(voteB));

    expect(get(voteRegistrationStore)).toEqual({
      registrations: [voteA, voteB],
    });
  });

  it("should remove completed voting items", () => {
    voteRegistrationStore.create(createArgs(voteA));
    voteRegistrationStore.create(createArgs(voteB));

    voteRegistrationStore.updateStatus({
      voteRegistration: voteA,
      status: "complete",
    });

    voteRegistrationStore.removeCompleted();

    expect(get(voteRegistrationStore)).toEqual({ registrations: [voteB] });
  });

  it("should reset votes", () => {
    voteRegistrationStore.create(createArgs(voteA));
    voteRegistrationStore.create(createArgs(voteB));

    voteRegistrationStore.reset();

    expect(get(voteRegistrationStore)).toEqual({ registrations: [] });
  });

  it("should update successfullyVotedNeuronIds", () => {
    const successfullyVotedNeuronIds = [BigInt(0), BigInt(2)];

    voteRegistrationStore.create(createArgs(voteA));
    voteRegistrationStore.create(createArgs(voteB));

    for (const neuronId of successfullyVotedNeuronIds) {
      voteRegistrationStore.addSuccessfullyVotedNeuronId({
        proposalId: voteA.proposalInfo.id as ProposalId,
        neuronId,
      });
    }

    expect(
      get(voteRegistrationStore).registrations.find(
        ({ proposalInfo: { id } }) => id === voteA.proposalInfo.id
      )?.successfullyVotedNeuronIds
    ).toEqual(successfullyVotedNeuronIds);
  });
});
