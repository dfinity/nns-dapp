import * as governanceApi from "$lib/api/governance.api";
import VotingHistoryModal from "$lib/modals/neurons/VotingHistoryModal.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("VotingHistoryModal", () => {
  const props = {
    neuronId: mockProposalInfo.proposer,
  };

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("api is working to get the neuron", () => {
    beforeEach(() => {
      vi.spyOn(governanceApi, "queryNeuron").mockResolvedValue(mockNeuron);
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
  });

  describe("api is throwing an error", () => {
    beforeEach(() => {
      vi.spyOn(governanceApi, "queryNeuron").mockRejectedValue(new Error());
    });

    it("should close on error", async () => {
      const onClose = vi.fn();
      const { component } = render(VotingHistoryModal, {
        props,
      });
      component.$on("nnsClose", onClose);

      await waitFor(() => expect(onClose).toBeCalled());
    });
  });
});
