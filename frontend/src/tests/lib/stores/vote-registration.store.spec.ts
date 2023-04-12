import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  voteRegistrationStore,
  type VoteRegistrationStoreEntry,
} from "$lib/stores/vote-registration.store";
import {
  mockProposalInfo,
  mockVoteRegistration,
} from "$tests/mocks/proposal.mock";
import type { ProposalId } from "@dfinity/nns";
import { get } from "svelte/store";

describe("voting-store", () => {
  const voteA: VoteRegistrationStoreEntry = {
    ...mockVoteRegistration,
    proposalInfo: {
      ...mockProposalInfo,
      id: BigInt(1),
    },
  };
  const voteB: VoteRegistrationStoreEntry = {
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
    voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });

    expect(get(voteRegistrationStore)).toEqual({
      registrations: { [OWN_CANISTER_ID.toText()]: [voteA] },
    });

    voteRegistrationStore.add({ ...voteB, canisterId: OWN_CANISTER_ID });

    expect(get(voteRegistrationStore)).toEqual({
      registrations: { [OWN_CANISTER_ID.toText()]: [voteA, voteB] },
    });
  });

  it("should update status", () => {
    voteRegistrationStore.reset();
    voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });

    voteRegistrationStore.updateStatus({
      proposalId: voteA.proposalInfo.id as ProposalId,
      status: "complete",
      canisterId: OWN_CANISTER_ID,
    });

    expect(
      get(voteRegistrationStore).registrations[OWN_CANISTER_ID.toText()][0]
        .status
    ).toEqual("complete");
  });

  it("should remove completed voting items", () => {
    voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });
    voteRegistrationStore.add({ ...voteB, canisterId: OWN_CANISTER_ID });

    voteRegistrationStore.updateStatus({
      status: "complete",
      proposalId: voteA.proposalInfo.id as ProposalId,
      canisterId: OWN_CANISTER_ID,
    });

    voteRegistrationStore.remove({
      proposalId: voteA.proposalInfo.id as ProposalId,
      canisterId: OWN_CANISTER_ID,
    });

    expect(get(voteRegistrationStore)).toEqual({
      registrations: { [OWN_CANISTER_ID.toText()]: [voteB] },
    });
  });

  it("should reset votes", () => {
    voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });
    voteRegistrationStore.add({ ...voteB, canisterId: OWN_CANISTER_ID });

    voteRegistrationStore.reset();

    expect(get(voteRegistrationStore)).toEqual({ registrations: {} });
  });

  it("should update successfullyVotedNeuronIds", () => {
    const successfullyVotedNeuronIds = [BigInt(0), BigInt(2)];

    voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });
    voteRegistrationStore.add({ ...voteB, canisterId: OWN_CANISTER_ID });

    for (const neuronId of successfullyVotedNeuronIds) {
      voteRegistrationStore.addSuccessfullyVotedNeuronId({
        proposalId: voteA.proposalInfo.id as ProposalId,
        neuronId,
        canisterId: OWN_CANISTER_ID,
      });
    }

    expect(
      get(voteRegistrationStore).registrations[OWN_CANISTER_ID.toText()].find(
        ({ proposalInfo: { id } }) => id === voteA.proposalInfo.id
      )?.successfullyVotedNeuronIds
    ).toEqual(successfullyVotedNeuronIds);
  });
});
