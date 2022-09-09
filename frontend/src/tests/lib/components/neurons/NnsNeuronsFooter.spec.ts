/**
 * @jest-environment jsdom
 */

import { NeuronState } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import NnsNeuronsFooter from "../../../../lib/components/neurons/NnsNeuronsFooter.svelte";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import { voteInProgressStore } from "../../../../lib/stores/voting.store";
import en from "../../../mocks/i18n.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "../../../mocks/neurons.mock";
import { mockVotingInProgressItem } from "../../../mocks/proposal.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    listNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

describe("NnsNeurons", () => {
  describe("with enough neurons", () => {
    beforeEach(() => {
      const mockNeuron2 = {
        ...mockNeuron,
        neuronId: BigInt(223),
      };
      const spawningNeuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        neuronId: BigInt(223),
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: BigInt(12312313),
        },
      };
      jest
        .spyOn(neuronsStore, "subscribe")
        .mockImplementation(
          buildMockNeuronsStoreSubscribe([
            mockNeuron,
            mockNeuron2,
            spawningNeuron,
          ])
        );
    });

    it("should open the CreateNeuronModal on click to Stake Neurons", async () => {
      const { queryByTestId, queryByText } = render(NnsNeuronsFooter);

      const toolbarButton = queryByTestId("stake-neuron-button");
      expect(toolbarButton).not.toBeNull();
      expect(queryByText(en.accounts.select_source)).toBeNull();

      toolbarButton !== null && (await fireEvent.click(toolbarButton));

      expect(queryByText(en.accounts.select_source)).not.toBeNull();
    });

    it("should disable Stake Neurons button during voting process", async () => {
      const { queryByTestId } = render(NnsNeuronsFooter);

      const stakeNeuronButton = queryByTestId("stake-neuron-button");
      expect(stakeNeuronButton).not.toBeNull();

      voteInProgressStore.add(mockVotingInProgressItem);

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
      jest
        .spyOn(neuronsStore, "subscribe")
        .mockImplementation(buildMockNeuronsStoreSubscribe([mockNeuron]));
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
