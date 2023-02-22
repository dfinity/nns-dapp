import {
  voteRegistrationStore,
  type VoteRegistration,
} from "$lib/stores/vote-registration.store";
import type { ProposalId } from "@dfinity/nns";
import { get } from "svelte/store";
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

  afterEach(() => {
    voteRegistrationStore.reset();
  });

  it("should set voting items", () => {
    voteRegistrationStore.add(voteA);

    expect(get(voteRegistrationStore)).toEqual({ registrations: [voteA] });

    voteRegistrationStore.add(voteB);

    expect(get(voteRegistrationStore)).toEqual({
      registrations: [voteA, voteB],
    });
  });

  it("should update status", () => {
    voteRegistrationStore.reset();
    voteRegistrationStore.add(voteA);

    voteRegistrationStore.updateStatus({
      proposalId: voteA.proposalInfo.id as ProposalId,
      status: "complete",
    });

    expect(get(voteRegistrationStore).registrations[0].status).toEqual(
      "complete"
    );
  });

  it("should remove completed voting items", () => {
    voteRegistrationStore.add(voteA);
    voteRegistrationStore.add(voteB);

    voteRegistrationStore.updateStatus({
      status: "complete",
      proposalId: voteA.proposalInfo.id as ProposalId,
    });

    voteRegistrationStore.remove(voteA.proposalInfo.id as ProposalId);

    expect(get(voteRegistrationStore)).toEqual({ registrations: [voteB] });
  });

  it("should reset votes", () => {
    voteRegistrationStore.add(voteA);
    voteRegistrationStore.add(voteB);

    voteRegistrationStore.reset();

    expect(get(voteRegistrationStore)).toEqual({ registrations: [] });
  });

  it("should update successfullyVotedNeuronIds", () => {
    const successfullyVotedNeuronIds = [BigInt(0), BigInt(2)];

    voteRegistrationStore.add(voteA);
    voteRegistrationStore.add(voteB);

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
