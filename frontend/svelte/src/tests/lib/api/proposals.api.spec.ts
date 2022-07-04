import { GovernanceCanister, Vote } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import {
  queryProposal,
  queryProposalPayload,
  queryProposals,
  registerVote,
} from "../../../lib/api/proposals.api";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/governance.canister.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-api", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  let spyListProposals;
  let spyRegisterVote;

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    spyListProposals = jest.spyOn(mockGovernanceCanister, "listProposals");
    spyRegisterVote = jest.spyOn(mockGovernanceCanister, "registerVote");
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
  });

  describe("load", () => {
    it("should call the canister to get proposalInfo", async () => {
      const proposal = await queryProposal({
        proposalId: BigInt(404),
        identity: mockIdentity,
        certified: false,
      });

      expect(proposal?.id).toBe(BigInt(404));
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

  describe("registerVote", () => {
    const neuronId = BigInt(0);
    const identity = mockIdentity;
    const proposalId = BigInt(0);

    it("should call the canister to cast vote neuronIds count", async () => {
      await registerVote({
        neuronId: neuronId,
        proposalId,
        vote: Vote.YES,
        identity,
      });
      expect(spyRegisterVote).toHaveBeenCalled();
    });
  });

  describe("queryProposalPayload", () => {
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.getProposalPayload.mockResolvedValue({});
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    afterAll(jest.clearAllMocks);

    it("should call the canister to get proposal payload", async () => {
      const spyGetProposalPayload = jest.spyOn(
        nnsDappMock,
        "getProposalPayload"
      );

      await queryProposalPayload({
        proposalId: BigInt(0),
        identity: mockIdentity,
      });

      expect(spyGetProposalPayload).toBeCalledTimes(1);
    });
  });
});
