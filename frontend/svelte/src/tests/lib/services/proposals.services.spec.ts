import { GovernanceCanister, ProposalInfo, Vote } from "@dfinity/nns";
import {
  castVote,
  getProposalId,
  listNextProposals,
  listProposals,
  loadProposal,
} from "../../../lib/services/proposals.services";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/governance.canister.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  let spyListProposals;
  let spyProposalInfo;
  let spyRegisterVote;

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    spyListProposals = jest.spyOn(mockGovernanceCanister, "listProposals");
    spyProposalInfo = jest.spyOn(mockGovernanceCanister, "getProposal");
    spyRegisterVote = jest.spyOn(mockGovernanceCanister, "registerVote");
  });

  afterEach(() => spyListProposals.mockClear());

  describe("list", () => {
    afterAll(() => proposalsStore.setProposals([]));

    it("should call the canister to list proposals", async () => {
      await listProposals({ identity: mockIdentity });

      expect(spyListProposals).toHaveReturnedTimes(1);
    });

    it("should call the canister to list the next proposals", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        identity: mockIdentity,
      });

      expect(spyListProposals).toHaveReturnedTimes(1);
    });

    it("should clear the list proposals before query", async () => {
      const spy = jest.spyOn(proposalsStore, "setProposals");
      await listProposals({ clearBeforeQuery: true, identity: mockIdentity });
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockClear();
    });

    it("should not clear the list proposals before query", async () => {
      const spy = jest.spyOn(proposalsStore, "setProposals");
      await listProposals({ clearBeforeQuery: false, identity: mockIdentity });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockClear();
    });

    it("should push new proposals to the list", async () => {
      const spy = jest.spyOn(proposalsStore, "pushProposals");
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        identity: mockIdentity,
      });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockClear();
    });

    it("should not push empty proposals to the list", async () => {
      const mockEmptyGovernanceCanister: MockGovernanceCanister =
        new MockGovernanceCanister([]);

      jest
        .spyOn(GovernanceCanister, "create")
        .mockImplementation(
          (): GovernanceCanister => mockEmptyGovernanceCanister
        );

      const spyListProposals = jest.spyOn(
        mockEmptyGovernanceCanister,
        "listProposals"
      );

      const spy = jest.spyOn(proposalsStore, "pushProposals");
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        identity: mockIdentity,
      });
      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockClear();

      spyListProposals.mockClear();
    });

    it("should get proposalInfo from proposals store if presented", (done) => {
      loadProposal({
        proposalId: mockProposals[mockProposals.length - 1].id as bigint,
        identity: mockIdentity,
        setProposal: (proposal: ProposalInfo) => {
          expect(proposal?.id).toBe(mockProposals[1].id);
          expect(spyListProposals).not.toBeCalled();
          expect(spyProposalInfo).not.toBeCalled();

          done();
        },
      });
    });

    it("should not call listProposals if not in the store", (done) => {
      loadProposal({
        proposalId: mockProposals[0].id as bigint,
        identity: mockIdentity,
        setProposal: (_proposalInfo: ProposalInfo) => {
          expect(spyListProposals).not.toBeCalled();
          done();
        },
      });
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

  describe("load", () => {
    it("should call the canister to get proposalInfo", (done) => {
      loadProposal({
        proposalId: mockProposals[0].id as bigint,
        identity: mockIdentity,
        setProposal: (proposal: ProposalInfo) => {
          expect(proposal?.id).toBe(mockProposals[0].id);
          expect(spyProposalInfo).toBeCalledTimes(1);

          done();
        },
      });
    });
  });

  describe("castVote", () => {
    const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
    const identity = mockIdentity;
    const proposalId = BigInt(0);

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
