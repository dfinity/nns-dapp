/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronMaturityCard from "../../../../lib/components/neuron-detail/NeuronMaturityCard.svelte";
import { E8S_PER_ICP } from "../../../../lib/constants/icp.constants";
import { authStore } from "../../../../lib/stores/auth.store";
import { formattedMaturity } from "../../../../lib/utils/neuron.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronMaturityCard", () => {
  const maturity = BigInt(E8S_PER_ICP * 2);

  const props = {
    neuron: {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        maturityE8sEquivalent: maturity,
        controller: mockIdentity.getPrincipal().toText(),
      },
    },
  };

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  it("renders maturity title", () => {
    const { queryByText } = render(NeuronMaturityCard, {
      props,
    });

    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();
  });

  it("renders formatted maturity", () => {
    const { queryByText } = render(NeuronMaturityCard, {
      props,
    });
    const formatted = formattedMaturity(props.neuron);

    expect(queryByText(formatted)).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByText } = render(NeuronMaturityCard, {
      props,
    });

    expect(queryByText(en.neuron_detail.merge_maturity)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.spawn_neuron)).toBeInTheDocument();
  });

  it("renders no actions if user not controller", () => {
    const props = {
      neuron: {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "not-controller",
        },
      },
    };

    const { queryByText } = render(NeuronMaturityCard, {
      props,
    });

    expect(
      queryByText(en.neuron_detail.merge_maturity)
    ).not.toBeInTheDocument();
    expect(queryByText(en.neuron_detail.spawn_neuron)).not.toBeInTheDocument();
  });
});
