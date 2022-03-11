/**
 * @jest-environment jsdom
 */

import { GovernanceCanister } from "@dfinity/nns";
import type { Proposal } from "@dfinity/nns/dist/types/types/governance_converters";
import { render, waitFor } from "@testing-library/svelte";
import ProposalShortSummary from "../../../../lib/components/proposals/ProposalShortSummary.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("ProposalShortSummary", () => {
  const props = {
    proposalId: mockProposals[0].id,
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render proposal summary", async () => {
    const { container, getByText } = render(ProposalShortSummary, {
      props,
    });

    await waitFor(() => expect(container.querySelector("p")).not.toBeNull());

    expect(
      getByText((mockProposals[0].proposal as Proposal).summary)
    ).toBeInTheDocument();
  });
});
