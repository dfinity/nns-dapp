/**
 * @jest-environment jsdom
 */

import type { BallotInfo } from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import type { Proposal } from "@dfinity/nns/dist/types/types/governance_converters";
import { render, waitFor } from "@testing-library/svelte";
import BallotSummary from "../../../../lib/components/neuron-detail/Ballots/BallotSummary.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import en from "../../../mocks/i18n.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";
import { silentConsoleErrors } from "../../../mocks/utils.mock";

describe("BallotSummary", () => {
  const mockBallot: BallotInfo = {
    vote: Vote.Yes,
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

  beforeAll(silentConsoleErrors);

  it("should render proposal id", async () => {
    const { queryByTestId, getByText } = render(BallotSummary, {
      props,
    });

    await waitFor(() => expect(queryByTestId("markdown-text")).not.toBeNull());

    expect(getByText(`${mockProposals[0].id}`)).toBeInTheDocument();
  });

  it("should render proposal summary", async () => {
    const { queryByTestId, getByText } = render(BallotSummary, {
      props,
    });

    await waitFor(() => expect(queryByTestId("markdown-text")).not.toBeNull());

    expect(
      getByText((mockProposals[0].proposal as Proposal).summary)
    ).toBeInTheDocument();
  });

  const testVote = async (vote: Vote) => {
    const { container, getByText } = render(BallotSummary, {
      props: {
        ballot: {
          ...mockBallot,
          vote,
        },
      },
    });

    await waitFor(() =>
      expect(container.querySelector("p.vote")).not.toBeNull()
    );

    expect(getByText(en.core[Vote[vote].toLowerCase()])).toBeInTheDocument();
  };

  it("should render ballot vote yes", async () => await testVote(Vote.Yes));

  it("should render ballot vote no", async () => await testVote(Vote.No));

  it("should render ballot vote unspecified", async () =>
    await testVote(Vote.Unspecified));
});
