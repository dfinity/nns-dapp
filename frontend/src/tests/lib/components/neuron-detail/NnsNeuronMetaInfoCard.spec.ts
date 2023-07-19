import NnsNeuronMetaInfoCard from "$lib/components/neuron-detail/NnsNeuronMetaInfoCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { secondsToDuration } from "$lib/utils/date.utils";
import { formatVotingPower, neuronAge } from "$lib/utils/neuron.utils";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronMetaInfoCard", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockMainAccount.principal?.toText() as string,
    },
  };

  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
    );
  });

  it("renders neuron id", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(queryByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
  });

  it("renders a NeuronCard", () => {
    // We can skip many edge cases tested in the NeuronCard
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(queryByTestId("neuron-card-title")).toBeInTheDocument();
  });

  it("renders voting power", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).toBeInTheDocument();
    expect(
      queryByText(formatVotingPower(mockNeuron.votingPower))
    ).toBeInTheDocument();
  });

  it("doest not render voting power if none", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          votingPower: undefined,
        },
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(
      queryByText(en.neurons.voting_power, { exact: false })
    ).not.toBeInTheDocument();
  });

  it("renders actions", () => {
    // Each action button is tested separately
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(
      queryByText(en.neuron_detail.increase_dissolve_delay)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.start_dissolving)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.increase_stake)
    ).not.toBeInTheDocument();
    expect(queryByText(en.neuron_detail.split_neuron)).toBeInTheDocument();
  });

  it("does not render specific actions if user is not controller", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            controller: "not-controller",
          },
        },
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(
      queryByText(en.neuron_detail.increase_dissolve_delay)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.start_dissolving)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.neuron_detail.increase_stake)
    ).not.toBeInTheDocument();
  });

  it("renders split neuron action if user is not controller", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            controller: "not-controller",
          },
        },
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(queryByText(en.neuron_detail.split_neuron)).toBeInTheDocument();
  });

  it("should render neuron age", () => {
    const { getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMetaInfoCard,
      },
    });

    expect(getByTestId("nns-neuron-age")?.textContent.trim()).toEqual(
      secondsToDuration(neuronAge(mockNeuron))
    );
  });
});
