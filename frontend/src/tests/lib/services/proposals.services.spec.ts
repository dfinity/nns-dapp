/**
 * @jest-environment jsdom
 */

import type { NeuronId, ProposalInfo } from "@dfinity/nns";
import { GovernanceError, Vote } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import * as api from "../../../lib/api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "../../../lib/canisters/nns-dapp/nns-dapp.errors";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import * as neuronsServices from "../../../lib/services/neurons.services";
import {
  listNextProposals,
  listProposals,
  loadProposal,
  loadProposalPayload,
  registerVotes,
  routePathProposalId,
} from "../../../lib/services/proposals.services";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
} from "../../../lib/stores/proposals.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import { voteInProgressStore } from "../../../lib/stores/voting.store";
import type { ToastMsg } from "../../../lib/types/toast";
import { waitForMilliseconds } from "../../../lib/utils/utils";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";
import { mockProposalInfo } from "../../mocks/proposal.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
  const firstErrorMessage = () => {
    const messages = get(toastsStore);
    const error = messages.find(({ level }) => level === "error");

    return error as ToastMsg;
  };

  describe("list", () => {
    const spySetProposals = jest.spyOn(proposalsStore, "setProposals");
    const spyPushProposals = jest.spyOn(proposalsStore, "pushProposals");
    let spyQueryProposals;

    beforeAll(() => {
      spyQueryProposals = jest
        .spyOn(api, "queryProposals")
        .mockImplementation(() => Promise.resolve(mockProposals));
    });

    afterEach(() => {
      proposalsStore.setProposals({ proposals: [], certified: true });

      spySetProposals.mockClear();
      spyPushProposals.mockClear();
    });

    afterAll(() => jest.clearAllMocks());

    it("should call the canister to list proposals", async () => {
      await listProposals();

      expect(spyQueryProposals).toHaveBeenCalled();

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should call the canister to list the next proposals", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });

      expect(spyQueryProposals).toHaveBeenCalled();

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should not clear the list proposals before query", async () => {
      await listProposals();
      expect(spySetProposals).toHaveBeenCalledTimes(2);
    });

    it("should push new proposals to the list", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });
      expect(spyPushProposals).toHaveBeenCalledTimes(2);
    });
  });

  describe("load", () => {
    const spyQueryProposal = jest
      .spyOn(api, "queryProposal")
      .mockImplementation(() =>
        Promise.resolve({ ...mockProposals[0], id: BigInt(666) })
      );

    beforeAll(() =>
      proposalsStore.setProposals({ proposals: mockProposals, certified: true })
    );

    afterEach(() => jest.clearAllMocks());

    it("should call the canister to get proposalInfo", async () => {
      let result;
      await loadProposal({
        proposalId: BigInt(666),
        setProposal: (proposal: ProposalInfo) => (result = proposal),
      });
      expect(result?.id).toBe(BigInt(666));
      expect(spyQueryProposal).toBeCalledTimes(2);
    });
  });

  describe("error message in details", () => {
    beforeEach(() => {
      jest.spyOn(api, "queryProposal").mockImplementation(() => {
        throw new Error("test-message");
      });
      jest.spyOn(console, "error").mockImplementation(jest.fn);
    });
    afterEach(() => jest.clearAllMocks());

    it("should show error message in details", async () => {
      const spyToastError = jest.spyOn(toastsStore, "show");

      await loadProposal({
        proposalId: BigInt(0),
        setProposal: jest.fn,
      });
      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        detail: 'id: "0". test-message',
        labelKey: "error.proposal_not_found",
        level: "error",
      });
    });
  });

  describe("empty list", () => {
    afterAll(() =>
      proposalsStore.setProposals({ proposals: [], certified: true })
    );

    it("should not push empty proposals to the list", async () => {
      jest
        .spyOn(api, "queryProposals")
        .mockImplementation(() => Promise.resolve([]));

      const spy = jest.spyOn(proposalsStore, "pushProposals");
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });
      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockClear();
    });
  });

  describe("details", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get proposalId from valid path", () => {
      let result = routePathProposalId("/#/proposal/123");
      expect(result?.proposalId).toEqual(BigInt(123));
      result = routePathProposalId("/#/proposal/0");
      expect(result?.proposalId).toEqual(BigInt(0));
    });

    it("should not get proposalId from invalid path", () => {
      expect(routePathProposalId("/#/proposal/")).toBeUndefined();
      expect(routePathProposalId("/#/proposal/1.5")).toBeUndefined();
      expect(routePathProposalId("/#/proposal/123n")).toBeUndefined();
    });
  });

  describe("vote registration", () => {
    const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
    const proposalId = BigInt(0);
    const proposalInfo: ProposalInfo = { ...mockProposalInfo, id: proposalId };

    describe("success", () => {
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
    });

    describe("refresh", () => {
      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());

      afterAll(() => jest.clearAllMocks());

      const mockRegisterVote = async (): Promise<void> => {
        return;
      };
      // const mockRequestRegisterVotes = async (): Promise<void> => {
      //   return;
      // };

      it("should refetch neurons after vote registration", async () => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);

        const spyOnListNeurons = jest
          .spyOn(neuronsServices, "listNeurons")
          .mockImplementation(() => Promise.resolve());

        await registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.YES,
          reloadProposalCallback: () => {
            // do nothing
          },
        });
        expect(spyOnListNeurons).toBeCalledTimes(1);
      });

      it("should call callback after vote", (done) => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);

        jest
          .spyOn(neuronsServices, "listNeurons")
          .mockImplementation(() => Promise.resolve());

        jest
          .spyOn(api, "queryProposal")
          .mockImplementation(() => Promise.resolve(mockProposalInfo));

        registerVotes({
          neuronIds,
          proposalInfo,
          vote: Vote.YES,
          reloadProposalCallback: () => {
            done();
          },
        });
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
          voteInProgressStore.reset();
          neuronsStore.reset();
        });

        it("should update voteInProgressStore", async () => {
          await registerVotes({
            neuronIds,
            proposalInfo,
            vote: Vote.YES,
            reloadProposalCallback: () => {
              //
            },
          });

          const $voteInProgressStore = get(voteInProgressStore);

          expect($voteInProgressStore.votes[0]).toBeDefined();
          expect($voteInProgressStore.votes[0].neuronIds).toEqual(neuronIds);
          expect($voteInProgressStore.votes[0].proposalId).toEqual(
            proposalInfo.id
          );
          expect($voteInProgressStore.votes[0].vote).toEqual(Vote.YES);
        });

        it("should update successfullyVotedNeuronIds in voteInProgressStore", async () => {
          await registerVotes({
            neuronIds,
            proposalInfo,
            vote: Vote.YES,
            reloadProposalCallback: () => {
              //
            },
          });

          const $voteInProgressStore = get(voteInProgressStore);

          expect(
            $voteInProgressStore.votes[0].successfullyVotedNeuronIds
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
            ({ level }) => level === "running"
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
            ({ level }) => level === "running"
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
            get(toastsStore).find(({ level }) => level === "running");

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
        jest
          .spyOn(api, "registerVote")
          .mockImplementation(mockRegisterVoteError);
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
        jest
          .spyOn(api, "registerVote")
          .mockImplementation(mockRegisterVoteError);
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
        jest
          .spyOn(api, "registerVote")
          .mockImplementation(mockRegisterVoteError);
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

    it("should not list proposals if no identity", async () => {
      const call = async () => await listProposals();

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
    });

    it("should not list next proposals if no identity", async () => {
      const call = async () =>
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
        });

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
    });

    it("should not load proposal if no identity", (done) => {
      loadProposal({
        proposalId: mockProposals[0].id as bigint,
        setProposal: jest.fn(),
        handleError: () => done(),
      });
    });

    it("should not register votes if no identity", async () => {
      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());

      const call = async () =>
        await registerVotes({
          neuronIds: [],
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

  describe("filter", () => {
    const spySetProposals = jest.spyOn(proposalsStore, "setProposals");
    const spyPushProposals = jest.spyOn(proposalsStore, "pushProposals");
    let spyQueryProposals;

    beforeAll(() => {
      jest.clearAllMocks();

      spyQueryProposals = jest
        .spyOn(api, "queryProposals")
        .mockImplementation(() => Promise.resolve(mockProposals));
    });

    afterEach(() => {
      proposalsStore.setProposals({ proposals: [], certified: true });

      spySetProposals.mockClear();
      spyPushProposals.mockClear();
    });

    afterAll(() => jest.clearAllMocks());

    it("should not call the canister if empty filter", async () => {
      proposalsFiltersStore.filterStatus([]);

      await listProposals();

      expect(spyQueryProposals).not.toHaveBeenCalled();

      proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
    });

    it("should reset the proposal store if empty filter", async () => {
      proposalsFiltersStore.filterStatus([]);

      await listProposals();

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual([]);

      proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
    });
  });

  describe("getProposalPayload", () => {
    const spyQueryProposalPayload = jest
      .spyOn(api, "queryProposalPayload")
      .mockImplementation(() => Promise.resolve({ data: "test" }));

    afterEach(() => jest.clearAllMocks());

    it("should call queryProposalPayload", async () => {
      await loadProposalPayload({ proposalId: BigInt(0) });
      expect(spyQueryProposalPayload).toBeCalledTimes(1);
    });

    it("should update proposalPayloadsStore", async () => {
      const spyOnSetPayload = jest.spyOn(proposalPayloadsStore, "setPayload");
      await loadProposalPayload({ proposalId: BigInt(0) });

      expect(spyOnSetPayload).toBeCalledTimes(2);
      expect(spyOnSetPayload).toHaveBeenLastCalledWith({
        payload: { data: "test" },
        proposalId: BigInt(0),
      });
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      jest.spyOn(api, "queryProposalPayload").mockImplementation(() => {
        throw new ProposalPayloadNotFoundError();
      });

      await loadProposalPayload({ proposalId: BigInt(0) });

      expect(get(proposalPayloadsStore).get(BigInt(0))).toBeNull();
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      jest.spyOn(api, "queryProposalPayload").mockImplementation(() => {
        throw new ProposalPayloadTooLargeError();
      });

      await loadProposalPayload({ proposalId: BigInt(0) });

      expect(get(proposalPayloadsStore).get(BigInt(0))).toEqual({
        error: "Payload too large",
      });
    });
  });
});
