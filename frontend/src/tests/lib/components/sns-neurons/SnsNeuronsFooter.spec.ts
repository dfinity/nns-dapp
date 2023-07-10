import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
import { snsSelectedProjectNewTxData } from "$lib/derived/sns/sns-selected-project-new-tx-data.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import {
  buildMockNeuronsStoreSubscribe,
  mockFullNeuron,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { NeuronState } from "@dfinity/nns";
import { TokenAmount } from "@dfinity/utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

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
    vi.spyOn(neuronsStore, "subscribe").mockImplementation(
      buildMockNeuronsStoreSubscribe([mockNeuron, mockNeuron2, spawningNeuron])
    );
  });

  it("should open the StakeSnsNeuronModal on click to stake SNS Neurons", async () => {
    vi.spyOn(snsSelectedProjectNewTxData, "subscribe").mockImplementation(
      mockStoreSubscribe({
        token: mockSnsFullProject.summary.token,
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        transactionFee: TokenAmount.fromE8s({
          amount: BigInt(10_000),
          token: mockSnsFullProject.summary.token,
        }),
      })
    );
    vi.spyOn(snsProjectSelectedStore, "subscribe").mockImplementation(
      mockStoreSubscribe(mockSnsFullProject)
    );
    const { queryByTestId } = render(SnsNeuronsFooter);

    const toolbarButton = queryByTestId("stake-sns-neuron-button");
    expect(toolbarButton).not.toBeNull();

    toolbarButton !== null && (await fireEvent.click(toolbarButton));

    await waitFor(() =>
      expect(queryByTestId("transaction-step-1")).toBeInTheDocument()
    );
  });
});
