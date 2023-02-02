/**
 * @jest-environment jsdom
 */

import { queryProposal } from "$lib/api/proposals.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import NnsProposalDetail from "$lib/pages/NnsProposalDetail.svelte";
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
    queryProposal: jest
      .fn()
      .mockImplementation(() => Promise.resolve(proposal)),
  };
});

jest.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

describe("Proposal detail page when not logged in user", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation((run: Subscriber<AuthStore>): (() => void) => {
        run({ identity: undefined });

        return () => undefined;
      });
  });

  it("should render proposal with uncertified data", async () => {
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    const { queryByTestId } = render(NnsProposalDetail, {
      props: {
        proposalIdText: proposal.id.toString(),
      },
    });

    await waitFor(() =>
      expect(queryByTestId("proposal-system-info-details")).toBeInTheDocument()
    );
    expect(queryByTestId("proposal-proposer-info-title")).toBeInTheDocument();
    expect(queryByTestId("login-button")).toBeInTheDocument();

    expect(queryProposal).toHaveBeenCalledTimes(1);
    expect(queryProposal).toHaveBeenCalledWith({
      proposalId: proposal.id,
      certified: false,
      identity: new AnonymousIdentity(),
    });
  });
});
