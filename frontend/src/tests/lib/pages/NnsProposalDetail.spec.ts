/**
 * @jest-environment jsdom
 */

import ProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
import { listNeurons } from "$lib/services/neurons.services";
import { authStore, type AuthStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import {
  mockAuthStoreSubscribe,
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

jest.mock("$lib/services/neurons.services", () => {
  return {
    listNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  const props = {
    proposalIdText: `${mockProposals[0].id}`,
  };

  describe("signed in", () => {
    beforeEach(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    it("should render proposal detail", async () => {
      const { queryByTestId } = render(ProposalDetail, props);
      await waitFor(() =>
        expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
      );
    });

    it("should load neurons", async () => {
      render(ProposalDetail, props);
      await waitFor(() => expect(listNeurons).toBeCalled());
    });
  });

  describe("not signed in", () => {
    beforeEach(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation((run: Subscriber<AuthStore>): (() => void) => {
          run({ identity: undefined });

          return () => undefined;
        });
    });

    it("should render proposal detail", async () => {
      const { queryByTestId } = render(ProposalDetail, props);
      await waitFor(() =>
        expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
      );
    });

    it("should not load neurons", async () => {
      render(ProposalDetail, props);
      await waitFor(() => expect(listNeurons).not.toBeCalled());
    });
  });
});
