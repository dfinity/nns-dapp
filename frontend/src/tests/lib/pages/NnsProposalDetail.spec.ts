/**
 * @jest-environment jsdom
 */

import { resetNeuronsApiService } from "$lib/api-services/neurons.api-service";
import * as governanceApi from "$lib/api/governance.api";
import ProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/governance.canister.mock";
import { MockLedgerCanister } from "../../mocks/ledger.canister.mock";
import { buildMockNeuronsStoreSubscribe } from "../../mocks/neurons.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
} from "../../mocks/proposals.store.mock";
import { silentConsoleErrors } from "../../utils/utils.test-utils";

jest.mock("$lib/api/governance.api");

describe("ProposalDetail", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  beforeAll(silentConsoleErrors);

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(proposalsStore, "subscribe")
      .mockImplementation(mockEmptyProposalsStoreSubscribe);

    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscribe([], false));
  });

  const props = {
    proposalIdText: `${mockProposals[0].id}`,
  };

  describe.only("logged in user", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      resetNeuronsApiService();
      authStoreMock.next({
        identity: mockIdentity,
      });
      jest.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
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
    });
  });

  describe("logged out user", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      resetNeuronsApiService();
      authStoreMock.next({
        identity: undefined,
      });
      jest.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
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
