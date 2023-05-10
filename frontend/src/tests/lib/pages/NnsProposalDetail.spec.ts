import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import ProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import { MockLedgerCanister } from "$tests/mocks/ledger.canister.mock";
import { buildMockNeuronsStoreSubscribe } from "$tests/mocks/neurons.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
} from "$tests/mocks/proposals.store.mock";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/api/governance.api");

describe("ProposalDetail", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  beforeEach(() => {
    silentConsoleErrors();
    vi.clearAllMocks();
    resetNeuronsApiService();
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    vi.spyOn(proposalsStore, "subscribe").mockImplementation(
      mockEmptyProposalsStoreSubscribe
    );

    vi.spyOn(GovernanceCanister, "create").mockReturnValue(
      mockGovernanceCanister
    );

    vi.spyOn(LedgerCanister, "create").mockReturnValue(mockLedgerCanister);

    vi.spyOn(neuronsStore, "subscribe").mockImplementation(
      buildMockNeuronsStoreSubscribe([], false)
    );
  });

  const props = {
    proposalIdText: `${mockProposals[0].id}`,
  };

  describe("logged in user", () => {
    beforeEach(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });
    it("should render proposal detail if signed in", async () => {
      const { queryByTestId } = render(ProposalDetail, props);
      await waitFor(() =>
        expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
      );
    });

    it("should query neurons", async () => {
      render(ProposalDetail, props);
      await waitFor(() =>
        expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
          identity: mockIdentity,
          certified: true,
        })
      );
      expect(governanceApi.queryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
      });
      expect(governanceApi.queryNeurons).toHaveBeenCalledTimes(2);
    });
  });

  describe("logged out user", () => {
    beforeEach(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });
    it("should render proposal detail if not signed in", async () => {
      const { queryByTestId } = render(ProposalDetail, props);
      await waitFor(() =>
        expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
      );
    });

    it("should NOT query neurons", async () => {
      render(ProposalDetail, props);
      await waitFor(() =>
        expect(governanceApi.queryNeurons).not.toHaveBeenCalled()
      );
    });
  });
});
