/**
 * @jest-environment jsdom
 */

import ProposalDetail from "$lib/pages/ProposalDetail.svelte";
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

  it("should render proposal detail if not signed in", async () => {
    authStoreMock.next({
      identity: undefined,
    });

    const { queryByTestId } = render(ProposalDetail, props);
    await waitFor(() =>
      expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
    );
  });

  it("should render proposal detail if signed in", async () => {
    authStoreMock.next({
      identity: mockIdentity,
    });

    const { queryByTestId } = render(ProposalDetail, props);
    await waitFor(() =>
      expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
    );
  });
});
