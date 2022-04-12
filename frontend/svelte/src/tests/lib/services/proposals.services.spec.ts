import type { NeuronId, ProposalInfo } from "@dfinity/nns";
import { GovernanceError, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import * as api from "../../../lib/api/proposals.api";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import * as neuronsServices from "../../../lib/services/neurons.services";
import {
  getProposalId,
  listNextProposals,
  listProposals,
  loadProposal,
  registerVotes,
} from "../../../lib/services/proposals.services";
import * as busyStore from "../../../lib/stores/busy.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "../../../lib/stores/proposals.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import type { ToastMsg } from "../../../lib/types/toast";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
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
    it("should get proposalId from valid path", async () => {
      expect(getProposalId("/#/proposal/123")).toBe(BigInt(123));
      expect(getProposalId("/#/proposal/0")).toBe(BigInt(0));
    });

    it("should not get proposalId from invalid path", async () => {
      expect(getProposalId("/#/proposal/")).toBeUndefined();
      expect(getProposalId("/#/proposal/1.5")).toBeUndefined();
      expect(getProposalId("/#/proposal/123n")).toBeUndefined();
    });
  });

  describe("vote registration", () => {
    const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
    const proposalId = BigInt(0);

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
          proposalId,
          vote: Vote.YES,
        });
        expect(spyRegisterVote).toHaveReturnedTimes(neuronIds.length);
      });

      it("should display appropriate busy screen", async () => {
        const spyBusyStart = jest.spyOn(busyStore, "startBusy");
        const spyBusyStop = jest.spyOn(busyStore, "stopBusy");
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.YES,
        });
        expect(spyBusyStart).toBeCalledWith("vote");
        expect(spyBusyStop).toBeCalledWith("vote");
      });

      it("should not display errors on successful vote registration", async () => {
        const spyToastShow = jest.spyOn(toastsStore, "show");
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.YES,
        });
        expect(spyToastShow).not.toBeCalled();
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

      it("should refetch neurons after vote registration", async () => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);

        const spyOnListNeurons = jest
          .spyOn(neuronsServices, "listNeurons")
          .mockImplementation(() => Promise.resolve());

        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.YES,
        });
        expect(spyOnListNeurons).toBeCalledTimes(1);
      });

      it("should show 'error.list_proposals' on refetch neurons error", async () => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);
        const err = new Error("test");
        const spyToastError = jest.spyOn(toastsStore, "error");
        // .mockImplementation((params) => (lastToastMessage = params));
        const spyOnListNeurons = jest
          .spyOn(neuronsServices, "listNeurons")
          .mockImplementation(() => Promise.reject(err));

        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(spyOnListNeurons).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          err,
          labelKey: "error.list_proposals",
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

      let lastToastMessage: ToastMsg;
      const spyToastShow = jest
        .spyOn(toastsStore, "show")
        .mockImplementation((params) => (lastToastMessage = params));

      beforeEach(
        () =>
          (lastToastMessage = {
            labelKey: "",
            level: "info",
          })
      );

      afterAll(() => jest.clearAllMocks());

      it("should show error.register_vote_unknown on not nns-js-based error", async () => {
        await registerVotes({
          neuronIds: null as unknown as NeuronId[],
          proposalId,
          vote: Vote.NO,
        });
        expect(lastToastMessage.labelKey).toBe("error.register_vote_unknown");
        expect(lastToastMessage.level).toBe("error");
      });

      it("should show error.register_vote on nns-js-based errors", async () => {
        jest
          .spyOn(api, "registerVote")
          .mockImplementation(mockRegisterVoteError);
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(spyToastShow).toBeCalled();
        expect(lastToastMessage.labelKey).toBe("error.register_vote");
        expect(lastToastMessage.level).toBe("error");
      });

      it("should show reason per neuron Error in detail", async () => {
        jest
          .spyOn(api, "registerVote")
          .mockImplementation(mockRegisterVoteError);
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(lastToastMessage?.detail?.split(/test/).length).toBe(
          neuronIds.length + 1
        );
      });

      it("should show reason per neuron GovernanceError in detail", async () => {
        jest
          .spyOn(api, "registerVote")
          .mockImplementation(mockRegisterVoteGovernanceError);
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(lastToastMessage?.detail?.split(/governance-error/).length).toBe(
          neuronIds.length + 1
        );
      });
    });
  });

  describe("errors", () => {
    beforeAll(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(() => jest.fn());
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
          proposalId: BigInt(1),
          vote: Vote.YES,
        });

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
    });
  });

  describe("suspisious responses", () => {
    beforeAll(() => {
      jest.clearAllMocks();
    });

    it("should display suspicious_response error", async () => {
      let requestIndex = 0;
      const spyQueryProposals = jest
        .spyOn(api, "queryProposals")
        .mockImplementation(() =>
          Promise.resolve(mockProposals.slice(requestIndex++))
        );
      const spyToastShow = jest.spyOn(toastsStore, "show");

      await listProposals();

      expect(spyQueryProposals).toBeCalled();
      expect(spyToastShow).toBeCalledWith({
        labelKey: "error.suspicious_response",
        level: "error",
      });
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
});
