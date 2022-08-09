/**
 * @jest-environment jsdom
 */

import SnsNeuronMetaInfoCard from "../../../../lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("SnsNeuronMetaInfoCard", () => {
  it("renders a SnsNeuronCard", () => {
    // We can skip many edge cases tested in the NeuronCard
    const { queryByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronMetaInfoCard,
      neuron: mockSnsNeuron,
      reload: jest.fn(),
    });

    expect(queryByTestId("sns-neuron-card-title")).toBeInTheDocument();
  });
});
