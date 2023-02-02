/**
 * @jest-environment jsdom
 */

import { queryProposals } from "$lib/api/proposals.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import NnsProposals from "$lib/pages/NnsProposals.svelte";
import { authStore, type AuthStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { AnonymousIdentity } from "@dfinity/agent";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { mockProposalInfo } from "../mocks/proposal.mock";

const proposal = {
  ...mockProposalInfo,
  topic: DEFAULT_PROPOSALS_FILTERS.topics[0],
  rewardStatus: DEFAULT_PROPOSALS_FILTERS.rewards[0],
  status: DEFAULT_PROPOSALS_FILTERS.status[0],
};

jest.mock("$lib/api/proposals.api", () => {
  return {
    queryProposals: jest
      .fn()
      .mockImplementation(() => Promise.resolve([proposal])),
  };
});

describe("Proposals when not logged in user", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation((run: Subscriber<AuthStore>): (() => void) => {
        run({ identity: undefined });

        return () => undefined;
      });
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
});
