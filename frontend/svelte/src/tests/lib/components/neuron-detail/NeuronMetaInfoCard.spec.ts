/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronMetaInfoCard from "../../../../lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
import * as utils from "../../../../lib/utils/neuron.utils";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronMetaInfoCard", () => {
  beforeEach(() => {
    jest
      .spyOn(utils, "isCurrentUserController")
      .mockImplementation((): boolean => true);
    jest
      .spyOn(utils, "hasJoinedCommunityFund")
      .mockImplementation((): boolean => false);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it("renders neuron id", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(queryByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
  });

  it("renders a NeuronCard", () => {
    // We can skip many edge cases tested in the NeuronCard
    const { queryByTestId } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(queryByTestId("neuron-card-title")).toBeInTheDocument();
  });

  it("renders voting power", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).toBeInTheDocument();
    expect(
      queryByText(utils.formatVotingPower(mockNeuron.votingPower))
    ).toBeInTheDocument();
  });

  it("doest not render voting power if none", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: {
        ...mockNeuron,
        votingPower: undefined,
      },
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).not.toBeInTheDocument();
  });

  it("renders actions", () => {
    // Each action button is tested separately
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(
      queryByText(en.neuron_detail.join_community_fund)
    ).toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.increase_dissolve_delay)
    ).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.split_neuron)).toBeInTheDocument();
  });

  it("renders no actions if user is not controller", () => {
    jest
      .spyOn(utils, "isCurrentUserController")
      .mockImplementation((): boolean => false);
    const { queryByText } = render(NeuronMetaInfoCard, {
      neuron: mockNeuron,
    });

    expect(
      queryByText(en.neuron_detail.join_community_fund)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.increase_dissolve_delay)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.start_dissolving)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.increase_stake)
    ).not.toBeInTheDocument();
    expect(queryByText(en.neuron_detail.split_neuron)).not.toBeInTheDocument();
  });
});
