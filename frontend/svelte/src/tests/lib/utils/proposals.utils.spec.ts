import { GovernanceCanister, ProposalInfo } from "@dfinity/nns";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import {
  emptyProposals,
  lastProposalId,
} from "../../../lib/utils/proposals.utils";
import { MockGovernanceCanister } from "../../mocks/proposals.store.mock";

describe("proposals-utils", () => {
  const mockProposals: ProposalInfo[] = [
    {
      id: "test1",
    },
    { id: "test2" },
  ] as unknown as ProposalInfo[];

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  let spyListProposals;

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    spyListProposals = jest.spyOn(mockGovernanceCanister, "listProposals");
  });

  afterEach(() => spyListProposals.mockClear());

  it("should detect an empty list of proposals", () =>
    expect(emptyProposals()).toBeTruthy());

  it("should detect an not empty list of proposals", () => {
    proposalsStore.setProposals(mockProposals);

    expect(emptyProposals()).toBeFalsy();

    proposalsStore.setProposals([]);
  });

  it("should find no last proposal id", () =>
    expect(lastProposalId()).toBeUndefined());

  it("should find a last proposal id", () => {
    proposalsStore.setProposals(mockProposals);

    expect(lastProposalId()).toEqual(
      mockProposals[mockProposals.length - 1].id
    );

    proposalsStore.setProposals([]);
  });
});
