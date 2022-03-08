/**
 * @jest-environment jsdom
 */

import { GovernanceCanister } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import Proposer from "../../../../lib/components/proposals/Proposer.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

const en = require("../../../../lib/i18n/en.json");

describe("Proposer", () => {
  const props = {
    proposalInfo: mockProposalInfo,
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

  it("should render proposer", () => {
    const { container } = render(Proposer, {
      props,
    });

    expect(container.querySelector("button small")?.textContent).toEqual(
      `${en.neuron_detail.proposer}: ${mockProposalInfo.proposer}`
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
