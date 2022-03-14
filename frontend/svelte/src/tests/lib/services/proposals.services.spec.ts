import type { Identity } from "@dfinity/agent";
import { GovernanceError, ProposalInfo, Vote } from "@dfinity/nns";
import { get } from "svelte/store";
import * as api from "../../../lib/api/proposals.api";
import {
  castVote,
  getProposalId,
  listNextProposals,
  listProposals,
  loadProposal,
} from "../../../lib/services/proposals.services";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
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
      await listProposals({ identity: mockIdentity });

      expect(spyQueryProposals).toHaveBeenCalled();

      const proposals = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should call the canister to list the next proposals", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        identity: mockIdentity,
      });

      expect(spyQueryProposals).toHaveBeenCalled();

      const proposals = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should clear the list proposals before query", async () => {
      await listProposals({ clearBeforeQuery: true, identity: mockIdentity });
      expect(spySetProposals).toHaveBeenCalledTimes(2);
    });

    it("should not clear the list proposals before query", async () => {
      await listProposals({ clearBeforeQuery: false, identity: mockIdentity });
      expect(spySetProposals).toHaveBeenCalledTimes(1);
    });

    it("should push new proposals to the list", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        identity: mockIdentity,
      });
      expect(spyPushProposals).toHaveBeenCalledTimes(1);
    });
  });

  describe("load", () => {
    const spyQueryProposals = jest
      .spyOn(api, "queryProposals")
      .mockImplementation(() => Promise.resolve(mockProposals));

    const spyQueryProposal = jest
      .spyOn(api, "queryProposal")
      .mockImplementation(() =>
        Promise.resolve({ ...mockProposals[0], id: BigInt(666) })
      );

    beforeAll(() => proposalsStore.setProposals(mockProposals));

    afterAll(() => jest.clearAllMocks());

    it("should get proposalInfo from proposals store if presented", (done) => {
      loadProposal({
        proposalId: mockProposals[mockProposals.length - 1].id as bigint,
        identity: mockIdentity,
        setProposal: (proposal: ProposalInfo) => {
          expect(proposal?.id).toBe(mockProposals[1].id);
          expect(spyQueryProposals).not.toBeCalled();
          expect(spyQueryProposal).not.toBeCalled();

          done();
        },
      });
    });

    it("should not call listProposals if in the store", (done) => {
      loadProposal({
        proposalId: mockProposals[0].id as bigint,
        identity: mockIdentity,
        setProposal: () => {
          expect(spyQueryProposals).not.toBeCalled();
          done();
        },
      });
    });

    it("should call the canister to get proposalInfo if not in store", (done) => {
      loadProposal({
        proposalId: BigInt(666),
        identity: mockIdentity,
        setProposal: (proposal: ProposalInfo) => {
          expect(proposal?.id).toBe(BigInt(666));
          expect(spyQueryProposal).toBeCalledTimes(1);
          expect(spyQueryProposal).toBeCalledWith({
            proposalId: BigInt(666),
            identity: mockIdentity,
          });

          done();
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
        identity: mockIdentity,
      });
      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockClear();
    });
  });

  describe("details", () => {
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

  describe("castVote", () => {
    const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
    const identity = mockIdentity;
    const proposalId = BigInt(0);

    const mockRegisterVote = async ({
      vote,
    }: {
      neuronId: bigint;
      vote: Vote;
      proposalId: bigint;
      identity: Identity;
    }): Promise<GovernanceError | undefined> => {
      return vote === Vote.YES
        ? undefined
        : { errorMessage: "error", errorType: 0 };
    };

    const spyRegisterVote = jest
      .spyOn(api, "registerVote")
      .mockImplementation(mockRegisterVote);

    afterAll(() => proposalsStore.setProposals([]));

    it("should call the canister to cast vote neuronIds count", async () => {
      await castVote({
        neuronIds,
        proposalId,
        vote: Vote.YES,
        identity,
      });
      expect(spyRegisterVote).toHaveReturnedTimes(3);
    });

    it("should return list of undefined on successful update", async () => {
      const results = await castVote({
        neuronIds,
        proposalId,
        vote: Vote.YES,
        identity,
      });
      expect(results).toEqual([undefined, undefined, undefined]);
    });

    it("should return list of unwrapped errors on update fail", async () => {
      const results = await castVote({
        neuronIds,
        proposalId,
        vote: Vote.NO,
        identity,
      });
      expect(results).toEqual([
        { errorMessage: "error", errorType: 0 },
        { errorMessage: "error", errorType: 0 },
        { errorMessage: "error", errorType: 0 },
      ]);
    });
  });
});
