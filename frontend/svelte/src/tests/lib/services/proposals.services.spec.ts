import { GovernanceCanister, ProposalInfo } from "@dfinity/nns";
import {
  getProposalId,
  getProposal,
  listNextProposals,
  listProposals,
} from "../../../lib/services/proposals.services";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
  const mockProposals: ProposalInfo[] = [
    { id: BigInt(100) },
    { id: BigInt(200) },
  ] as unknown as ProposalInfo[];

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  let spyListProposals;
  let spyProposalInfo;

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    spyListProposals = jest.spyOn(mockGovernanceCanister, "listProposals");
    spyProposalInfo = jest.spyOn(mockGovernanceCanister, "getProposal");
  });

  afterEach(() => spyListProposals.mockClear());

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

  it("should get proposalId from valid path", async () => {
    expect(getProposalId("/#/proposal/123")).toBe(BigInt(123));
    expect(getProposalId("/#/proposal/0")).toBe(BigInt(0));
  });

  it("should not get proposalId from invalid path", async () => {
    expect(getProposalId("/#/proposal/")).toBeUndefined();
    expect(getProposalId("/#/proposal/1.5")).toBeUndefined();
    expect(getProposalId("/#/proposal/123n")).toBeUndefined();
  });

  it("should get proposalInfo from proposals store if presented", async () => {
    const proposal = await getProposal({
      proposalId: BigInt(100),
      identity: mockIdentity,
    });
    expect(proposal?.id).toBe(BigInt(100));
    expect(spyListProposals).not.toBeCalled();
    expect(spyProposalInfo).not.toBeCalled();
  });

  it("should call the canister to get proposalInfo", async () => {
    const proposal = await getProposal({
      proposalId: BigInt(404),
      identity: mockIdentity,
    });
    expect(proposal?.id).toBe(BigInt(404));
    expect(spyProposalInfo).toBeCalledTimes(1);
  });

  it("should not call listProposals if not in the store", async () => {
    await getProposal({
      proposalId: BigInt(404),
      identity: mockIdentity,
    });
    expect(spyListProposals).not.toBeCalled();
  });
});
