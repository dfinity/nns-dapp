import {
  GovernanceCanister,
  ListProposalsRequest,
  ListProposalsResponse,
} from "@dfinity/nns";
import type { ProposalInfo } from "../../../../../../../nns-js/src";
import { proposalsStore } from "../../../lib/stores/proposals.store";
import {
  emptyProposals,
  lastProposalId,
  listNextProposals,
  listProposals,
} from "../../../lib/utils/proposals.utils";

const mockProposals: ProposalInfo[] = [
  {
    id: "test1",
  },
  { id: "test2" },
] as unknown as ProposalInfo[];

// @ts-ignore
class MockGovernanceCanister extends GovernanceCanister {
  constructor() {
    super();
  }

  create() {
    return this;
  }

  public listProposals = async ({
    request,
    certified = true,
  }: {
    request: ListProposalsRequest;
    certified?: boolean;
  }): Promise<ListProposalsResponse> => {
    return {
      proposals: mockProposals,
    };
  };
}

describe("proposals-utils", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister();

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

  it("should call the canister to list proposals", async () => {
    await listProposals({});

    expect(spyListProposals).toHaveReturnedTimes(1);
  });

  it("should call the canister to list the next proposals", async () => {
    await listNextProposals({
      beforeProposal: mockProposals[mockProposals.length - 1].id,
    });

    expect(spyListProposals).toHaveReturnedTimes(1);
  });

  it("should clear the list proposals before query", async () => {
    const spy = jest.spyOn(proposalsStore, "setProposals");
    await listProposals({ clearBeforeQuery: true });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockClear();
  });

  it("should not clear the list proposals before query", async () => {
    const spy = jest.spyOn(proposalsStore, "setProposals");
    await listProposals({ clearBeforeQuery: false });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();
  });
});
