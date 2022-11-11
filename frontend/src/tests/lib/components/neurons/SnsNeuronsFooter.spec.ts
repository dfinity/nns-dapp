/**
 * @jest-environment jsdom
 */

import SnsNeuronsFooter from "$lib/components/neurons/SnsNeuronsFooter.svelte";
import { snsSelectedProjectNewTxData } from "$lib/derived/selected-project-new-tx-data.derived";
import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { neuronsStore } from "$lib/stores/neurons.store";
import { NeuronState, TokenAmount } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockStoreSubscribe } from "../../../mocks/commont.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "../../../mocks/neurons.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";

describe("SnsNeuron footer", () => {
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

  it("should open the StakeSnsNeuronModal on click to stake SNS Neurons", async () => {
    jest.spyOn(snsSelectedProjectNewTxData, "subscribe").mockImplementation(
      mockStoreSubscribe({
        token: mockSnsFullProject.summary.token,
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        transactionFee: TokenAmount.fromE8s({
          amount: BigInt(10_000),
          token: mockSnsFullProject.summary.token,
        }),
      })
    );
    jest
      .spyOn(snsProjectSelectedStore, "subscribe")
      .mockImplementation(mockStoreSubscribe(mockSnsFullProject));
    const { queryByTestId } = render(SnsNeuronsFooter);

    const toolbarButton = queryByTestId("stake-sns-neuron-button");
    expect(toolbarButton).not.toBeNull();

    toolbarButton !== null && (await fireEvent.click(toolbarButton));

    await waitFor(() =>
      expect(queryByTestId("transaction-step-1")).toBeInTheDocument()
    );
  });
});
