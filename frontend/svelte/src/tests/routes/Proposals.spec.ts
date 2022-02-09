/**
 * @jest-environment jsdom
 */

import { GovernanceCanister, ProposalInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import { proposalsStore } from "../../lib/stores/proposals.store";
import Proposals from "../../routes/Proposals.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import {
  MockGovernanceCanister,
  mockProposalsStoreSubscribe,
} from "../mocks/proposals.store.mock";

describe("Proposals", () => {
  let authStoreMock, proposalsStoreMock;

  const mockProposals: ProposalInfo[] = [
    {
      id: "test1",
    },
    { id: "test2" },
  ] as unknown as ProposalInfo[];

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
});
