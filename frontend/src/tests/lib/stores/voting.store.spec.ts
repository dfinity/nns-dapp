import { get } from "svelte/store";
import { voteInProgressStore } from "../../../lib/stores/voting.store";
import { mockVotingInProgressItem } from "../../mocks/proposal.mock";

describe("voting-store", () => {
  const voteA = {
    ...mockVotingInProgressItem,
    proposalId: BigInt(1),
  };
  const voteB = {
    ...mockVotingInProgressItem,
    proposalId: BigInt(2),
  };

  afterEach(() => {
    voteInProgressStore.reset();
  });

  it("should set voting items", () => {
    voteInProgressStore.add(voteA);

    expect(get(voteInProgressStore)).toEqual({ votes: [voteA] });

    voteInProgressStore.add(voteB);

    expect(get(voteInProgressStore)).toEqual({ votes: [voteA, voteB] });
  });

  it("should remove voting items", () => {
    voteInProgressStore.add(voteA);
    voteInProgressStore.add(voteB);

    voteInProgressStore.remove(voteB.proposalId);

    expect(get(voteInProgressStore)).toEqual({ votes: [voteA] });
  });

  it("should reset votes", () => {
    voteInProgressStore.add(voteA);
    voteInProgressStore.add(voteB);

    voteInProgressStore.reset();

    expect(get(voteInProgressStore)).toEqual({ votes: [] });
  });

  it("should update successfullyVotedNeuronIds", () => {
    const successfullyVotedNeuronIds = [BigInt(0), BigInt(2)];

    voteInProgressStore.add(voteA);
    voteInProgressStore.add(voteB);

    for (const neuronId of successfullyVotedNeuronIds) {
      voteInProgressStore.addSuccessfullyVotedNeuronId({
        proposalId: voteA.proposalId,
        neuronId,
      });
    }

    expect(
      get(voteInProgressStore).votes.find(
        ({ proposalId }) => proposalId === voteA.proposalId
      )?.successfullyVotedNeuronIds
    ).toEqual(successfullyVotedNeuronIds);
  });
});
