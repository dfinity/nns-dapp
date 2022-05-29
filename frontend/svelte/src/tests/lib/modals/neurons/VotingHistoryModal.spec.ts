/**
 * @jest-environment jsdom
 */

import { GovernanceCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import VotingHistoryModal from "../../../../lib/modals/neurons/VotingHistoryModal.svelte";
import { authStore } from "../../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import en from "../../../mocks/i18n.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("VotingHistoryModal", () => {
  const props = {
    neuronId: mockProposalInfo.proposer,
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(jest.fn);
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should display modal", () => {
    const { container } = render(VotingHistoryModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render a title", () => {
    const { getByText } = render(VotingHistoryModal, {
      props,
    });

    expect(getByText(en.neuron_detail.title)).toBeInTheDocument();
  });

  it("should render a neuron card", async () => {
    const { container } = render(VotingHistoryModal, {
      props,
    });

    await waitFor(() =>
      expect(container.querySelector("article")).not.toBeNull()
    );
  });

  it("should close on error", async () => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => {
        throw new Error("test");
      });

    const onClose = jest.fn();
    const { component } = render(VotingHistoryModal, {
      props,
    });
    component.$on("nnsClose", onClose);

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
