import NnsNeuronsFooter from "$lib/components/neurons/NnsNeuronsFooter.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import en from "$tests/mocks/i18n.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import { mockVoteRegistration } from "$tests/mocks/proposal.mock";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    listNeurons: vi.fn().mockResolvedValue(undefined),
  };
});

describe("NnsNeurons", () => {
  describe("with enough neurons", () => {
    beforeEach(() => {
      const mockNeuron2 = {
        ...mockNeuron,
        neuronId: 223n,
      };
      const spawningNeuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        neuronId: 456n,
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: 12_312_313n,
        },
      };
      vi.spyOn(neuronsStore, "subscribe").mockImplementation(
        buildMockNeuronsStoreSubscribe([
          mockNeuron,
          mockNeuron2,
          spawningNeuron,
        ])
      );
    });

    it("should open stake neuron modal", async () => {
      // To avoid that the modal requests the accounts
      icpAccountsStore.setForTesting(mockAccountsStoreData);
      const { queryByTestId, queryByText, getByTestId } =
        render(NnsNeuronsFooter);

      const toolbarButton = queryByTestId("stake-neuron-button");
      expect(toolbarButton).not.toBeNull();
      expect(queryByText(en.accounts.select_source)).toBeNull();

      toolbarButton !== null && (await fireEvent.click(toolbarButton));

      await waitFor(() =>
        expect(getByTestId("transaction-from-account")).not.toBeNull()
      );
    });

    it("should disable Stake Neurons button during voting process", async () => {
      const { queryByTestId } = render(NnsNeuronsFooter);

      const stakeNeuronButton = queryByTestId("stake-neuron-button");
      expect(stakeNeuronButton).not.toBeNull();

      voteRegistrationStore.add({
        ...mockVoteRegistration,
        canisterId: OWN_CANISTER_ID,
      });

      waitFor(() =>
        expect(stakeNeuronButton?.getAttribute("disabled")).not.toBeNull()
      );
    });

    it("should open the MergeNeuronsModal on click to Merge Neurons", async () => {
      const { queryByTestId, queryByText } = render(NnsNeuronsFooter);

      const toolbarButton = queryByTestId("merge-neurons-button");
      expect(toolbarButton).not.toBeNull();
      expect(queryByText(en.neurons.merge_neurons_modal_title)).toBeNull();

      toolbarButton !== null && (await fireEvent.click(toolbarButton));

      expect(queryByText(en.neurons.merge_neurons_modal_title)).not.toBeNull();
    });
  });

  describe("with less than two neurons", () => {
    beforeEach(() => {
      vi.spyOn(neuronsStore, "subscribe").mockImplementation(
        buildMockNeuronsStoreSubscribe([mockNeuron])
      );
    });
    it("should have disabled Merge Neurons button", async () => {
      const { queryByTestId } = render(NnsNeuronsFooter);

      const toolbarButton = queryByTestId("merge-neurons-button");
      expect(toolbarButton).not.toBeNull();
      toolbarButton &&
        expect(toolbarButton.hasAttribute("disabled")).toBeTruthy();
    });
  });
});
