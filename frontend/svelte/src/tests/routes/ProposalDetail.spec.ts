/**
 * @jest-environment jsdom
 */

import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import { neuronsStore } from "../../lib/stores/neurons.store";
import { proposalsStore } from "../../lib/stores/proposals.store";
import { routeStore } from "../../lib/stores/route.store";
import ProposalDetail from "../../routes/ProposalDetail.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../mocks/governance.canister.mock";
import en from "../mocks/i18n.mock";
import { MockLedgerCanister } from "../mocks/ledger.canister.mock";
import { buildMockNeuronsStoreSubscribe } from "../mocks/neurons.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  mockProposals,
} from "../mocks/proposals.store.mock";
import { mockRouteStoreSubscribe } from "../mocks/route.store.mock";
import { silentConsoleErrors } from "../mocks/utils.mock";

describe("ProposalDetail", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  beforeAll(silentConsoleErrors);

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(routeStore, "subscribe")
      .mockImplementation(
        mockRouteStoreSubscribe(`/#/proposal/${mockProposals[0].id}`)
      );

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

  it("should render loading neurons", async () => {
    const { getByText } = render(ProposalDetail);

    await waitFor(() =>
      expect(
        getByText(en.proposal_detail.loading_neurons, { exact: false })
      ).toBeInTheDocument()
    );
  });
});
