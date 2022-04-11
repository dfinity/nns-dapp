/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronMaturityCard from "../../../../lib/components/neuron-detail/NeuronMaturityCard.svelte";
import { E8S_PER_ICP } from "../../../../lib/constants/icp.constants";
import { formatPercentage } from "../../../../lib/utils/format.utils";
import * as utils from "../../../../lib/utils/neuron.utils";
import { maturityByStake } from "../../../../lib/utils/neuron.utils";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronMaturityCard", () => {
  beforeEach(() => {
    jest
      .spyOn(utils, "isCurrentUserController")
      .mockImplementation((): boolean => true);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it("renders maturity title", () => {
    const { queryByText } = render(NeuronMaturityCard, {
      neuron: mockNeuron,
    });

    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();
  });

  it("renders maturity in %", () => {
    const maturity = BigInt(E8S_PER_ICP * 2);
    const neuron = {
      ...mockNeuron,
      fullNeuonr: {
        ...mockFullNeuron,
        maturityE8sEquivalent: maturity,
      },
    };
    const { queryByText } = render(NeuronMaturityCard, {
      neuron,
    });
    const inPercentage = maturityByStake(neuron);

    expect(queryByText(formatPercentage(inPercentage))).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByText } = render(NeuronMaturityCard, {
      neuron: mockNeuron,
    });

    expect(queryByText(en.neuron_detail.merge_maturity)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.spawn_neuron)).toBeInTheDocument();
  });

  it("renders no actions if user not controller", () => {
    jest
      .spyOn(utils, "isCurrentUserController")
      .mockImplementation((): boolean => false);
    const { queryByText } = render(NeuronMaturityCard, {
      neuron: mockNeuron,
    });

    expect(
      queryByText(en.neuron_detail.merge_maturity)
    ).not.toBeInTheDocument();
    expect(queryByText(en.neuron_detail.spawn_neuron)).not.toBeInTheDocument();
  });
});
