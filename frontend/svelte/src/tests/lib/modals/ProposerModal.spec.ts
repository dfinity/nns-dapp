/**
 * @jest-environment jsdom
 */

import { GovernanceCanister } from "@dfinity/nns";
import {render, waitFor} from "@testing-library/svelte";
import ProposerModal from "../../../lib/modals/proposals/ProposerModal.svelte";
import { authStore } from "../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../mocks/governance.canister.mock";
import { mockProposalInfo } from "../../mocks/proposal.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

const en = require("../../../lib/i18n/en.json");

describe("ProposerModal", () => {
  const props = {
    proposalInfo: mockProposalInfo,
    visible: true,
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

  it("should display modal", () => {
    const { container } = render(ProposerModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render a title", () => {
    const { getByText } = render(ProposerModal, {
      props,
    });

    expect(getByText(en.neuron_detail.title)).toBeInTheDocument();
  });

  it("should render a neuron card", async () => {
    const { container } = render(ProposerModal, {
      props,
    });

    await waitFor(() =>
        expect(container.querySelector("article")).not.toBeNull()
    );
  });
});
