import * as agent from "$lib/api/agent.api";
import Proposer from "$lib/components/proposals/Proposer.svelte";
import { authStore } from "$lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import en from "$tests/mocks/i18n.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import type { HttpAgent } from "@dfinity/agent";
import { GovernanceCanister } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("Proposer", () => {
  const props = {
    proposalInfo: mockProposalInfo,
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => mockGovernanceCanister
    );

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  it("should render proposer", () => {
    const { container } = render(Proposer, {
      props,
    });

    expect(container.querySelector("button")?.textContent).toEqual(
      `${en.proposal_detail.proposer_prefix}: ${mockProposalInfo.proposer}`
    );
  });

  it("should render button to open modal", () => {
    const { container } = render(Proposer, {
      props,
    });

    expect(container.querySelector("button.text")).not.toBeNull();
  });

  it("should open proposer modal", async () => {
    const { container } = render(Proposer, {
      props,
    });

    const button = container.querySelector("button.text");
    expect(button).not.toBeNull();
    button && (await fireEvent.click(button));

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });
});
