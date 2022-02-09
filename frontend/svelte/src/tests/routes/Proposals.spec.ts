/**
 * @jest-environment jsdom
 */

import { GovernanceCanister } from "@dfinity/nns";
import {render, waitFor} from '@testing-library/svelte';
import { authStore } from "../../lib/stores/auth.store";
import { proposalsStore } from "../../lib/stores/proposals.store";
import Proposals from "../../routes/Proposals.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import {
  MockGovernanceCanister,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "../mocks/proposals.store.mock";

describe("Proposals", () => {
  let authStoreMock, proposalsStoreMock;

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    proposalsStoreMock = jest
      .spyOn(proposalsStore, "subscribe")
      .mockImplementation(mockProposalsStoreSubscribe);

    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);
  });

  it("should render a title", () => {
    const { container } = render(Proposals);

    const title: HTMLHeadingElement | null = container.querySelector("h1");
    expect(title).not.toBeNull();
    expect(title.textContent).toEqual("Voting");
  });

  it("should render a description", () => {
    const { getByText } = render(Proposals);

    expect(
      getByText(
        "The Internet Computer network runs under the control of the Network Nervous System",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("should render filters", () => {
    const { getByText } = render(Proposals);

    expect(getByText("Topics")).toBeInTheDocument();
    expect(getByText("Reward Status")).toBeInTheDocument();
    expect(getByText("Proposal Status")).toBeInTheDocument();
    expect(
      getByText('Hide "Open" proposals', {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("should not render a spinner", async () => {
    const { container, component } = render(Proposals);
    expect(container.querySelector("div.spinner")).toBeNull();
  });

  it("should render proposals", () => {
    const { getByText } = render(Proposals);

    expect(getByText(mockProposals[0].proposal.title)).toBeInTheDocument();
    expect(getByText(mockProposals[1].proposal.title)).toBeInTheDocument();
  });
});
