import { GovernanceCanister, ProposalInfo, Vote } from "@dfinity/nns";
import {
  getProposalId,
  listNextProposals,
  listProposals,
  loadProposal,
  registerVotes,
} from "../../../lib/services/proposals.services";
import { authStore } from "../../../lib/stores/auth.store";
import { busyStore } from "../../../lib/stores/busy.store";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/governance.canister.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  let spyListProposals;
  let spyGetProposal;
  let spyRegisterVote;

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    spyListProposals = jest.spyOn(mockGovernanceCanister, "listProposals");
    spyGetProposal = jest.spyOn(mockGovernanceCanister, "getProposal");
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
          expect(spyGetProposal).not.toBeCalled();

          done();
        },
      });
    });

    it("should not call listProposals if not in the store", (done) => {
      loadProposal({
        proposalId: mockProposals[0].id as bigint,
        identity: mockIdentity,
        setProposal: () => {
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
        proposalId: BigInt(404),
        identity: mockIdentity,
        setProposal: (proposal: ProposalInfo) => {
          expect(proposal?.id).toBe(BigInt(404));
          expect(spyGetProposal).toBeCalledTimes(1);
          expect(spyGetProposal).toBeCalledWith({
            proposalId: BigInt(404),
            certified: true,
          });

          done();
        },
      });
    });
  });

  describe("vote registration", () => {
    const neuronIds = [BigInt(0), BigInt(1), BigInt(2)];
    const identity = mockIdentity;
    const proposalId = BigInt(0);

    beforeEach(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    it("should call the canister to register multiple votes", async () => {
      await registerVotes({
        neuronIds,
        proposalId,
        vote: Vote.YES,
        identity,
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
        identity,
      });
      expect(spyBusyStart).toBeCalledWith("vote");
      expect(spyBusyStop).toBeCalledWith("vote");
    });

    it("should show multiple nns-js errors in details", async () => {
      jest
        .spyOn(mockGovernanceCanister, "registerVote")
        .mockImplementation(async ({ neuronId }) => ({
          Err: { errorMessage: `${neuronId}`, errorType: 0 },
        }));
      const spyToastShow = jest.spyOn(toastsStore, "show");
      await registerVotes({
        neuronIds,
        proposalId,
        vote: Vote.NO,
        identity,
      });
      expect(spyToastShow).toBeCalledTimes(1);
      expect(spyToastShow).toBeCalledWith({
        labelKey: "error.register_vote",
        level: "error",
        detail: "\n" + neuronIds.map((id) => `"${id}"`).join("\n"),
      });
    });

    it("should show only unique nns-js errors", async () => {
      let registerVoteCallCount = 0;
      jest
        .spyOn(mockGovernanceCanister, "registerVote")
        .mockImplementation(async () => ({
          Err: {
            errorMessage: registerVoteCallCount++ === 0 ? "error0" : "error1",
            errorType: 0,
          },
        }));
      const spyToastShow = jest.spyOn(toastsStore, "show");
      await registerVotes({
        neuronIds,
        proposalId,
        vote: Vote.NO,
        identity,
      });
      expect(spyToastShow).toBeCalledWith({
        labelKey: "error.register_vote",
        level: "error",
        detail: `\n"error0"\n"error1"`,
      });
    });

    it("should show register_vote_unknown on not nns-js-based error", async () => {
      jest
        .spyOn(mockGovernanceCanister, "registerVote")
        .mockImplementation(async () => {
          throw new Error("test");
        });
      const spyToastShow = jest.spyOn(toastsStore, "show");
      await registerVotes({
        neuronIds,
        proposalId,
        vote: Vote.NO,
        identity,
      });
      expect(spyToastShow).toBeCalledWith({
        labelKey: "error.register_vote_unknown",
        level: "error",
        detail: "{}",
      });
    });

    it("should refetch neurons after vote registration", async () => {
      const spyOnListNeurons = jest.spyOn(
        mockGovernanceCanister,
        "listNeurons"
      );
      await registerVotes({
        neuronIds,
        proposalId,
        vote: Vote.YES,
        identity,
      });
      expect(spyOnListNeurons).toBeCalledTimes(1);
    });
  });
});
