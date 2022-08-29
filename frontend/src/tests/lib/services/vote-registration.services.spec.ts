/**
 * @jest-environment jsdom
 */

import type { NeuronId, ProposalInfo } from "@dfinity/nns";
import { GovernanceError, Vote } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import * as api from "../../../lib/api/proposals.api";
import * as neuronsServices from "../../../lib/services/neurons.services";
import { registerVotes } from "../../../lib/services/vote-registration.services";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import { voteRegistrationStore } from "../../../lib/stores/vote-registration.store";
import type { ToastMsg } from "../../../lib/types/toast";
import { waitForMilliseconds } from "../../../lib/utils/utils";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";
import { mockProposalInfo } from "../../mocks/proposal.mock";

describe("vote-registration-services", () => {
  const firstErrorMessage = () => {
    const messages = get(toastsStore);
    const error = messages.find(({ level }) => level === "error");

    return error as ToastMsg;
  };
  const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
  const proposalId = BigInt(0);
  const proposalInfo: ProposalInfo = { ...mockProposalInfo, id: proposalId };

  describe("success voting", () => {
    jest
      .spyOn(neuronsServices, "listNeurons")
      .mockImplementation(() => Promise.resolve());

    afterAll(() => jest.clearAllMocks());

    const mockRegisterVote = async (): Promise<void> => {
      return;
    };

    const spyRegisterVote = jest
      .spyOn(api, "registerVote")
      .mockImplementation(mockRegisterVote);

    it("should call the canister to register multiple votes", async () => {
      await registerVotes({
        neuronIds,
        proposalInfo,
        vote: Vote.YES,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      expect(spyRegisterVote).toBeCalledTimes(neuronIds.length);
    });

    it("should not display errors on successful vote registration", async () => {
      const spyToastError = jest.spyOn(toastsStore, "error");
      await registerVotes({
        neuronIds,
        proposalInfo,
        vote: Vote.YES,
        reloadProposalCallback: () => {
          // do nothing
        },
      });
      expect(spyToastError).not.toBeCalled();
    });

    describe("voting in progress", () => {
      beforeEach(() => {
        jest
          .spyOn(neuronsServices, "listNeurons")
          .mockImplementation(() => Promise.resolve());
        jest
          .spyOn(api, "queryProposal")
          .mockImplementation(() => Promise.resolve(mockProposalInfo));

        jest
          .spyOn(api, "registerVote")
          .mockImplementation(() => waitForMilliseconds(10));

        neuronsStore.setNeurons({
          neurons: [BigInt(0), BigInt(1), BigInt(2)].map((neuronId) => ({
            ...mockNeuron,
            neuronId,
          })),
          certified: true,
        });
      });

      afterEach(() => {
        jest.clearAllMocks();

        toastsStore.reset();
        voteRegistrationStore.reset();
        neuronsStore.reset();
      });

      it("should update store", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.YES,
          reloadProposalCallback: () => {
            //
          },
        });

        const $voteRegistrationStore = get(voteRegistrationStore);

        expect($voteRegistrationStore.registrations[0]).toBeDefined();
        expect($voteRegistrationStore.registrations[0].neuronIds).toEqual(
          neuronIds
        );
        expect($voteRegistrationStore.registrations[0].proposalInfo.id).toEqual(
          proposalInfo.id
        );
        expect($voteRegistrationStore.registrations[0].vote).toEqual(Vote.YES);
      });

      it("should update successfullyVotedNeuronIds in the store", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.YES,
          reloadProposalCallback: () => {
            //
          },
        });

        const $voteRegistrationStore = get(voteRegistrationStore);

        expect(
          $voteRegistrationStore.registrations[0].successfullyVotedNeuronIds
        ).toEqual(neuronIds);
      });

      it("should show the vote adopt_in_progress toast", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.YES,
          reloadProposalCallback: () => {
            //
          },
        });

        const message = get(toastsStore).find(
          ({ spinner }) => spinner === true
        );
        expect(message).toBeDefined();
        expect(message?.labelKey).toEqual(
          "proposal_detail__vote.vote_adopt_in_progress"
        );
      });

      it("should show the vote reject_in_progress toast", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.NO,
          reloadProposalCallback: () => {
            //
          },
        });

        const message = get(toastsStore).find(
          ({ spinner }) => spinner === true
        );
        expect(message).toBeDefined();
        expect(message?.labelKey).toEqual(
          "proposal_detail__vote.vote_reject_in_progress"
        );
      });

      it("should hide the vote in progress toast after voting", async () => {
        await registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.YES,
          reloadProposalCallback: () => {
            //
          },
        });

        const message = () =>
          get(toastsStore).find(({ spinner }) => spinner === true);

        expect(message()).toBeDefined();

        await waitFor(() => expect(message()).not.toBeDefined());
      });
    });
  });

  describe("register vote errors", () => {
    jest
      .spyOn(neuronsServices, "listNeurons")
      .mockImplementation(() => Promise.resolve());

    const mockRegisterVoteError = async (): Promise<void> => {
      throw new Error("test");
    };
    const mockRegisterVoteGovernanceError = async (): Promise<void> => {
      throw new GovernanceError({
        error_message: "governance-error",
        error_type: 0,
      });
    };

    const resetToasts = () => {
      const toasts = get(toastsStore);
      toasts.forEach(() => toastsStore.hide());
    };

    beforeEach(resetToasts);

    afterAll(() => {
      jest.clearAllMocks();
      resetToasts();
    });

    it("should show error.register_vote_unknown on not nns-js-based error", async () => {
      await registerVotes({
        neuronIds: null as unknown as NeuronId[],
        proposalInfo,
        vote: Vote.NO,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      const error = firstErrorMessage();

      expect(error.labelKey).toBe("error.register_vote_unknown");
    });

    it("should show error.register_vote on nns-js-based errors", async () => {
      jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVoteError);
      await registerVotes({
        neuronIds,
        proposalInfo,
        vote: Vote.NO,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      const error = firstErrorMessage();

      expect(error.labelKey).toBe("error.register_vote");
    });

    it("should display proopsalId in error detail", async () => {
      jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVoteError);
      await registerVotes({
        neuronIds,
        proposalInfo,
        vote: Vote.NO,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      const error = firstErrorMessage();

      expect(error?.substitutions?.$proposalId).toBe("0");
    });

    it("should show reason per neuron Error in detail", async () => {
      jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVoteError);
      await registerVotes({
        neuronIds,
        proposalInfo,
        vote: Vote.NO,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      const error = firstErrorMessage();

      expect(error?.detail?.split(/test/).length).toBe(neuronIds.length + 1);
    });

    it("should show reason per neuron GovernanceError in detail", async () => {
      jest
        .spyOn(api, "registerVote")
        .mockImplementation(mockRegisterVoteGovernanceError);
      await registerVotes({
        neuronIds,
        proposalInfo,
        vote: Vote.NO,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

      const error = firstErrorMessage();

      expect(error?.detail?.split(/governance-error/).length).toBe(
        neuronIds.length + 1
      );
    });
  });
});

describe("errors", () => {
  const proposalId = BigInt(0);
  const proposalInfo: ProposalInfo = { ...mockProposalInfo, id: proposalId };

  beforeAll(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(jest.fn);
    setNoIdentity();
  });

  afterAll(() => {
    jest.clearAllMocks();

    resetIdentity();
  });

  it.only("should not register votes if no identity", async () => {
    jest
      .spyOn(neuronsServices, "listNeurons")
      .mockImplementation(() => Promise.resolve());

    const call = async () =>
      await registerVotes({
        neuronIds: [BigInt(0)],
        proposalInfo,
        vote: Vote.YES,
        reloadProposalCallback: () => {
          // do nothing
        },
      });

    await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
  });
});

describe("ignore errors", () => {
  const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
  const proposalId = BigInt(0);
  const proposalInfo: ProposalInfo = { ...mockProposalInfo, id: proposalId };

  const mockRegisterVoteGovernanceAlreadyVotedError =
    async (): Promise<void> => {
      throw new GovernanceError({
        error_message: "Neuron already voted on proposal.",
        error_type: 0,
      });
    };

  let spyToastError;

  beforeEach(() => {
    jest
      .spyOn(api, "registerVote")
      .mockImplementation(mockRegisterVoteGovernanceAlreadyVotedError);

    spyToastError = jest
      .spyOn(toastsStore, "error")
      .mockImplementation(jest.fn());
  });

  afterAll(() => jest.clearAllMocks());

  it("should ignore already voted error", async () => {
    await registerVotes({
      neuronIds,
      proposalInfo,
      vote: Vote.NO,
      reloadProposalCallback: () => {
        // do nothing
      },
    });
    expect(spyToastError).not.toBeCalled();
  });
});
