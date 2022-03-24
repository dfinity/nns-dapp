import type { Identity } from "@dfinity/agent";
import type { ProposalInfo } from "@dfinity/nns";
import { GovernanceError, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import * as api from "../../../lib/api/proposals.api";
import * as neuronsServices from "../../../lib/services/neurons.services";
import {
  getProposalId,
  listNextProposals,
  listProposals,
  loadProposal,
  registerVotes,
} from "../../../lib/services/proposals.services";
import { busyStore } from "../../../lib/stores/busy.store";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
  describe("list", () => {
    const spyQueryProposals = jest
      .spyOn(api, "queryProposals")
      .mockImplementation(() => Promise.resolve(mockProposals));

    const spySetProposals = jest.spyOn(proposalsStore, "setProposals");
    const spyPushProposals = jest.spyOn(proposalsStore, "pushProposals");

    afterEach(() => {
      proposalsStore.setProposals([]);

      spySetProposals.mockClear();
      spyPushProposals.mockClear();
    });

    afterAll(() => jest.clearAllMocks());

    it("should call the canister to list proposals", async () => {
      await listProposals({});

      expect(spyQueryProposals).toHaveBeenCalled();

      const proposals = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should call the canister to list the next proposals", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });

      expect(spyQueryProposals).toHaveBeenCalled();

      const proposals = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should clear the list proposals before query", async () => {
      await listProposals({ clearBeforeQuery: true });
      expect(spySetProposals).toHaveBeenCalledTimes(2);
    });

    it("should not clear the list proposals before query", async () => {
      await listProposals({ clearBeforeQuery: false });
      expect(spySetProposals).toHaveBeenCalledTimes(1);
    });

    it("should push new proposals to the list", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });
      expect(spyPushProposals).toHaveBeenCalledTimes(1);
    });
  });

  describe("load", () => {
    const spyQueryProposal = jest
      .spyOn(api, "queryProposal")
      .mockImplementation(() =>
        Promise.resolve({ ...mockProposals[0], id: BigInt(666) })
      );

    beforeAll(() => proposalsStore.setProposals(mockProposals));

    afterEach(() => jest.clearAllMocks());

    it("should call the canister to get proposalInfo", (done) => {
      let notDone = true;
      loadProposal({
        proposalId: BigInt(666),
        setProposal: (proposal: ProposalInfo) => {
          expect(proposal?.id).toBe(BigInt(666));
          expect(spyQueryProposal).toBeCalledTimes(1);

          if (notDone) {
            notDone = false;
            done();
          }
        },
      });
    });
  });

  describe("empty list", () => {
    afterAll(() => proposalsStore.setProposals([]));

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
        const spyBusyStart = jest.spyOn(busyStore, "start");
        const spyBusyStop = jest.spyOn(busyStore, "stop");
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
    });

    describe("multiple errors nns-js", () => {
      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());

      afterAll(() => jest.clearAllMocks());

      const mockRegisterVote = async ({
        neuronId,
      }: {
        neuronId: bigint;
        vote: Vote;
        proposalId: bigint;
        identity: Identity;
      }): Promise<void> => {
        throw new GovernanceError({
          error_message: `${neuronId}`,
          error_type: 0,
        });
      };

      it("should show multiple nns-js errors in details", async () => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);

        const spyToastShow = jest.spyOn(toastsStore, "show");
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(spyToastShow).toBeCalledTimes(1);
        expect(spyToastShow).toBeCalledWith({
          labelKey: "error.register_vote",
          level: "error",
          detail: "\n" + neuronIds.map((id) => `"${id}"`).join("\n"),
        });
      });
    });

    describe("unique errors nns-js", () => {
      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());

      afterAll(() => jest.clearAllMocks());

      let registerVoteCallCount = 0;

      const mockRegisterVote = async (): Promise<void> => {
        throw new GovernanceError({
          error_message: registerVoteCallCount++ === 0 ? "error0" : "error1",
          error_type: 0,
        });
      };

      it("should show only unique nns-js errors", async () => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);

        const spyToastShow = jest.spyOn(toastsStore, "show");
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(spyToastShow).toBeCalledWith({
          labelKey: "error.register_vote",
          level: "error",
          detail: `\n"error0"\n"error1"`,
        });
      });
    });

    describe("unknown errors", () => {
      jest
        .spyOn(neuronsServices, "listNeurons")
        .mockImplementation(() => Promise.resolve());

      afterAll(() => jest.clearAllMocks());

      const mockRegisterVote = async (): Promise<void> => {
        throw new Error("test");
      };

      it("should show register_vote_unknown on not nns-js-based error", async () => {
        jest.spyOn(api, "registerVote").mockImplementation(mockRegisterVote);

        const spyToastShow = jest.spyOn(toastsStore, "show");
        await registerVotes({
          neuronIds,
          proposalId,
          vote: Vote.NO,
        });
        expect(spyToastShow).toBeCalledWith({
          labelKey: "error.register_vote_unknown",
          level: "error",
          detail: "test",
        });
      });
    });
  });

  describe("errors", () => {
    beforeAll(() => {
      jest.spyOn(console, "error").mockImplementation(() => jest.fn());

      setNoIdentity();
    });

    afterAll(() => {
      jest.clearAllMocks();

      resetIdentity();
    });

    it("should not list proposals if no identity", async () => {
      const call = async () => await listProposals({});

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
});
