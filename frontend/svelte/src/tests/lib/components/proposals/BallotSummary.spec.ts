/**
 * @jest-environment jsdom
 */

import { BallotInfo, GovernanceCanister, Vote } from "@dfinity/nns";
import type { Proposal } from "@dfinity/nns/dist/types/types/governance_converters";
import { render, waitFor } from "@testing-library/svelte";
import BallotSummary from "../../../../lib/components/proposals/BallotSummary.svelte";
import * as en from "../../../../lib/i18n/en.json";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("BallotSummary", () => {
  const mockBallot: BallotInfo = {
    vote: Vote.YES,
    proposalId: mockProposals[0].id,
  };

  const props = {
    ballot: mockBallot,
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
    const { container, getByText } = render(BallotSummary, {
      props,
    });

    await waitFor(() =>
      expect(container.querySelector("div.markdown p")).not.toBeNull()
    );

    expect(
      getByText((mockProposals[0].proposal as Proposal).summary)
    ).toBeInTheDocument();
  });

  it("should render ballot vote", async () => {
    const { container, getByText } = render(BallotSummary, {
      props,
    });

    await waitFor(() =>
      expect(container.querySelector("p.vote")).not.toBeNull()
    );

    expect(
      getByText(en.core[Vote[mockBallot.vote].toLowerCase()])
    ).toBeInTheDocument();
  });
});
