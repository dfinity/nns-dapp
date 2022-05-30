/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronMetaInfoCard from "../../../../lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { authStore } from "../../../../lib/stores/auth.store";
import { formatVotingPower } from "../../../../lib/utils/neuron.utils";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronMetaInfoCard", () => {
  const props = {
    neuron: {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockMainAccount.principal?.toText() as string,
      },
    },
  };

  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
      );
  });

  it("renders neuron id", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      props,
    });

    expect(queryByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
  });

  it("renders a NeuronCard", () => {
    // We can skip many edge cases tested in the NeuronCard
    const { queryByTestId } = render(NeuronMetaInfoCard, {
      props,
    });

    expect(queryByTestId("neuron-card-title")).toBeInTheDocument();
  });

  it("renders voting power", () => {
    const { queryByText } = render(NeuronMetaInfoCard, {
      props,
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).toBeInTheDocument();
    expect(
      queryByText(formatVotingPower(mockNeuron.votingPower))
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
      props,
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
    const props = {
      neuron: {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "not-controller",
        },
      },
    };

    const { queryByText } = render(NeuronMetaInfoCard, {
      props,
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
