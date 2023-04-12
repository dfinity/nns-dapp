import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  voteRegistrationStore,
  type VoteRegistrationStoreEntry,
} from "$lib/stores/vote-registration.store";
import { mockVoteRegistration } from "$tests/mocks/proposal.mock";
import { get } from "svelte/store";

describe("voting-store", () => {
  const voteA: VoteRegistrationStoreEntry = {
    ...mockVoteRegistration,
    proposalIdString: "1",
  };
  const voteB: VoteRegistrationStoreEntry = {
    ...mockVoteRegistration,
    proposalIdString: "2",
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
      proposalIdString: voteA.proposalIdString,
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
      proposalIdString: voteA.proposalIdString,
      canisterId: OWN_CANISTER_ID,
    });

    voteRegistrationStore.remove({
      proposalIdString: voteA.proposalIdString,
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

  it("should update successfullyVotedNeuronIdStrings", () => {
    const successfullyVotedNeuronIdStrings = ["0", "2"];

    voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });
    voteRegistrationStore.add({ ...voteB, canisterId: OWN_CANISTER_ID });

    for (const neuronIdString of successfullyVotedNeuronIdStrings) {
      voteRegistrationStore.addSuccessfullyVotedNeuronId({
        proposalIdString: voteA.proposalIdString,
        neuronIdString,
        canisterId: OWN_CANISTER_ID,
      });
    }

    expect(
      get(voteRegistrationStore).registrations[OWN_CANISTER_ID.toText()].find(
        ({ proposalIdString }) => proposalIdString === voteA.proposalIdString
      )?.successfullyVotedNeuronIdStrings
    ).toEqual(successfullyVotedNeuronIdStrings);
  });
});
