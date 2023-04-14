import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  voteRegistrationStore,
  votingNeuronSelectStore,
  type VoteRegistrationStoreEntry,
} from "$lib/stores/vote-registration.store";
import type { VotingNeuron } from "$lib/types/proposals";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
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

  describe("voteRegistrationStore", () => {
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

    it("should support universes", () => {
      voteRegistrationStore.reset();
      voteRegistrationStore.add({ ...voteA, canisterId: OWN_CANISTER_ID });
      voteRegistrationStore.add({ ...voteB, canisterId: mockPrincipal });

      expect(
        get(voteRegistrationStore).registrations[OWN_CANISTER_ID.toText()][0]
      ).toEqual(voteA);
      expect(
        get(voteRegistrationStore).registrations[mockPrincipal.toText()][0]
      ).toEqual(voteB);
    });
  });

  describe("votingNeuronSelectStore", () => {
    const neuronIds = [0, 1, 2].map(String);
    const neurons = neuronIds.map(
      (neuronIdString) =>
        ({
          neuronIdString,
          votingPower: 0n,
        } as VotingNeuron)
    );

    it("should set neurons", () => {
      votingNeuronSelectStore.set(neurons);
      expect(get(votingNeuronSelectStore).neurons).toEqual(neurons);
    });

    it("should select all on set", () => {
      votingNeuronSelectStore.set(neurons);
      expect(get(votingNeuronSelectStore).selectedIds).toEqual(
        neuronIds.map(String)
      );
    });

    it("should preserve user selection", () => {
      votingNeuronSelectStore.set(neurons);
      votingNeuronSelectStore.toggleSelection(`${neuronIds[1]}`);
      votingNeuronSelectStore.updateNeurons([
        ...neurons,
        {
          neuronIdString: "3",
          votingPower: 0n,
        } as VotingNeuron,
      ]);
      expect(get(votingNeuronSelectStore).selectedIds).toEqual(
        [0, 2, 3].map(String)
      );
    });

    it("should toggle by neuronId", () => {
      votingNeuronSelectStore.set(neurons);

      votingNeuronSelectStore.toggleSelection(`${neuronIds[1]}`);
      votingNeuronSelectStore.toggleSelection(`${neuronIds[1]}`);
      votingNeuronSelectStore.toggleSelection(`${neuronIds[2]}`);
      expect(get(votingNeuronSelectStore).selectedIds).toEqual(
        [neuronIds[0], neuronIds[1]].map(String)
      );
    });
  });
});
