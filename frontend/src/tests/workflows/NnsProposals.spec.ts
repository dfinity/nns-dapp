import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import { queryProposals } from "$lib/api/proposals.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { authStore, type AuthStoreData } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { vi } from "vitest";

const proposal = {
  ...mockProposalInfo,
  topic: DEFAULT_PROPOSALS_FILTERS.topics[0],
  rewardStatus: DEFAULT_PROPOSALS_FILTERS.rewards[0],
  status: DEFAULT_PROPOSALS_FILTERS.status[0],
};

vi.mock("$lib/api/proposals.api", () => {
  return {
    queryProposals: vi
      .fn()
      .mockImplementation(() => Promise.resolve([proposal])),
  };
});

vi.mock("$lib/api/governance.api");

describe("NnsProposals", () => {
  afterEach(() => {
    vi.clearAllMocks();
    neuronsStore.reset();
    resetNeuronsApiService();
  });

  describe("when signed in user", () => {
    beforeEach(() => {
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });

    it("should list proposals certified and uncertified", async () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      const { queryAllByTestId } = render(NnsProposals);

      await waitFor(() =>
        expect(queryAllByTestId("proposal-card").length).toBeGreaterThan(0)
      );

      expect(queryProposals).toHaveBeenCalledTimes(2);
      expect(queryProposals).toHaveBeenCalledWith({
        beforeProposal: undefined,
        certified: false,
        filters: DEFAULT_PROPOSALS_FILTERS,
        identity: mockIdentity,
      });
      expect(queryProposals).toHaveBeenCalledWith({
        beforeProposal: undefined,
        certified: true,
        filters: DEFAULT_PROPOSALS_FILTERS,
        identity: mockIdentity,
      });
    });

    it("should query neurons", async () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      render(NnsProposals);

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

  describe("when not signed in user", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        (run: Subscriber<AuthStoreData>): (() => void) => {
          run({ identity: undefined });

          return () => undefined;
        }
      );
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
    });

    it("should list uncertified proposals", async () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      const { queryAllByTestId } = render(NnsProposals);

      await waitFor(() =>
        expect(queryAllByTestId("proposal-card").length).toBeGreaterThan(0)
      );

      expect(queryProposals).toHaveBeenCalledTimes(1);
      expect(queryProposals).toHaveBeenCalledWith({
        beforeProposal: undefined,
        certified: false,
        filters: DEFAULT_PROPOSALS_FILTERS,
        identity: new AnonymousIdentity(),
      });
    });

    it("should NOT query neurons", async () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      render(NnsProposals);

      await waitFor(() =>
        expect(governanceApi.queryNeurons).not.toHaveBeenCalled()
      );
    });
  });
});
