/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SnsNeuronMetaInfoCard from "../../../../lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("SnsNeuronMetaInfoCard", () => {
  const props = {
    neuron: mockSnsNeuron,
  };

  it("renders a SnsNeuronCard", () => {
    // We can skip many edge cases tested in the NeuronCard
    const { queryByTestId } = render(SnsNeuronMetaInfoCard, {
      props,
    });

    expect(queryByTestId("sns-neuron-card-title")).toBeInTheDocument();
  });
});
