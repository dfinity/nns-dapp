import {
  queryProposal,
  queryProposalPayload,
  queryProposals,
} from "$lib/api/proposals.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { GovernanceCanister } from "@dfinity/nns";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

describe("proposals-api", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  let spyListProposals;

  beforeEach(() => {
    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => mockGovernanceCanister
    );

    spyListProposals = vi.spyOn(mockGovernanceCanister, "listProposals");
  });

  afterEach(() => spyListProposals.mockClear());

  describe("list", () => {
    it("should call the canister to list proposals", async () => {
      await queryProposals({
        beforeProposal: undefined,
        filters: DEFAULT_PROPOSALS_FILTERS,
        identity: mockIdentity,
        certified: true,
      });

      expect(spyListProposals).toHaveReturnedTimes(1);
    });

    it("should call the canister to list the next proposals", async () => {
      await queryProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        filters: DEFAULT_PROPOSALS_FILTERS,
        identity: mockIdentity,
        certified: true,
      });

      expect(spyListProposals).toHaveReturnedTimes(1);
    });

    it("should call with no excluded topics if topics filter is empty", async () => {
      await queryProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
        filters: {
          ...DEFAULT_PROPOSALS_FILTERS,
          topics: [],
        },
        identity: mockIdentity,
        certified: true,
      });

      expect(spyListProposals).toHaveBeenCalledWith({
        certified: true,
        request: {
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          excludeTopic: [],
          includeRewardStatus: DEFAULT_PROPOSALS_FILTERS.rewards,
          includeStatus: DEFAULT_PROPOSALS_FILTERS.status,
          limit: 100,
        },
      });
    });
  });

  describe("load", () => {
    it("should call the canister to get proposalInfo", async () => {
      const proposalId = BigInt(404);
      const certified = false;

      const proposal = await queryProposal({
        proposalId,
        identity: mockIdentity,
        certified,
      });

      expect(proposal?.id).toBe(proposalId);
      expect(spyListProposals).toBeCalledTimes(1);
      expect(spyListProposals).toBeCalledWith({
        certified: false,
        request: {
          beforeProposal: BigInt(404 + 1),
          // TODO: check filters
          excludeTopic: [],
          includeRewardStatus: [],
          includeStatus: [],
          limit: 1,
        },
      });
    });
  });

  describe("queryProposalPayload", () => {
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.getProposalPayload.mockResolvedValue({});
    vi.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    afterAll(vi.clearAllMocks);

    it("should call the canister to get proposal payload", async () => {
      const spyGetProposalPayload = vi.spyOn(nnsDappMock, "getProposalPayload");

      await queryProposalPayload({
        proposalId: BigInt(0),
        identity: mockIdentity,
      });

      expect(spyGetProposalPayload).toBeCalledTimes(1);
    });
  });
});
