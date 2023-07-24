import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import en from "$tests/mocks/i18n.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { GovernanceCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";

describe("VotingHistoryModal", () => {
  const props = {
    neuronId: mockProposalInfo.proposer,
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();
    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => mockGovernanceCanister
    );
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
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
    const { queryByTestId } = render(VotingHistoryModal, {
      props,
    });

    await waitFor(() => expect(queryByTestId("neuron-card")).not.toBeNull());
  });

  it("should close on error", async () => {
    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => {
        throw new Error("test");
      }
    );

    const onClose = vi.fn();
    const { component } = render(VotingHistoryModal, {
      props,
    });
    component.$on("nnsClose", onClose);

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
