/**
 * @jest-environment jsdom
 */

import NnsNeuronMaturityCard from "$lib/components/neuron-detail/NnsNeuronMaturityCard.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import {
  formattedStakedMaturity,
  formattedTotalMaturity,
} from "$lib/utils/neuron.utils";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
} from "$tests/mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronMaturityCard", () => {
  const maturity = BigInt(E8S_PER_ICP * 2);

  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: maturity,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  it("renders maturity title", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();
  });

  it("renders formatted total maturity", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    const formatted = formattedTotalMaturity(neuron);

    expect(queryByText(formatted)).toBeInTheDocument();
  });

  it("should not render staked formatted maturity if not provided", () => {
    const { getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    expect(() => getByTestId("staked-maturity")).toThrow();
  });

  it("renders staked formatted maturity", () => {
    const stakedMaturityE8sEquivalent = BigInt(E8S_PER_ICP * 3);

    const neuronStake = {
      ...mockNeuron,
      fullNeuron: {
        ...neuron.fullNeuron,
        stakedMaturityE8sEquivalent,
      },
    };

    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: neuronStake,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    const formatted = formattedStakedMaturity(neuronStake);

    expect(queryByText(formatted)).toBeInTheDocument();
  });

  it("renders maturity plus staked formatted maturity", () => {
    const stakedMaturityE8sEquivalent = BigInt(E8S_PER_ICP * 3);

    const neuronStake = {
      ...mockNeuron,
      fullNeuron: {
        ...neuron.fullNeuron,
        stakedMaturityE8sEquivalent,
      },
    };

    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: neuronStake,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    const formatted = formattedTotalMaturity(neuronStake);

    expect(queryByText(formatted)).toBeInTheDocument();
  });

  it("renders actions", () => {
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    expect(queryByText(en.neuron_detail.stake_maturity)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.spawn_neuron)).toBeInTheDocument();
  });

  it("renders no actions if user not controller", () => {
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: "not-controller",
      },
    };

    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    expect(
      queryByText(en.neuron_detail.stake_maturity)
    ).not.toBeInTheDocument();
    expect(queryByText(en.neuron_detail.spawn_neuron)).not.toBeInTheDocument();
  });

  it("should render stake maturity action", () => {
    const { getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    expect(getByTestId("stake-maturity-button")).not.toBeNull();
  });

  it("should render stake maturity description", () => {
    const { getByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    const description = getByTestId("maturity-description");

    const div = document.createElement("div");
    div.innerHTML = en.neuron_detail.stake_maturity_tooltip;

    expect(description?.textContent?.trim()).toEqual(div.textContent.trim());

    expect(description?.querySelector("a")).not.toBeNull();
  });

  it("should render auto stake maturity action", async () => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronMaturityCard,
      },
    });

    expect(
      container.querySelector('input[id="auto-stake-maturity-checkbox"]')
    ).not.toBeNull();
  });

  describe("hw", () => {
    beforeAll(() =>
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(
          mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
        )
    );

    const neuronHW = {
      ...neuron,
      fullNeuron: {
        ...neuron.fullNeuron,
        controller: mockHardwareWalletAccount?.principal?.toText(),
      },
    };

    it("should render stake maturity action for hardware wallet", () => {
      const { getByTestId } = render(NeuronContextActionsTest, {
        props: {
          neuron: neuronHW,
          testComponent: NnsNeuronMaturityCard,
        },
      });

      expect(getByTestId("stake-maturity-button")).not.toBeNull();
    });

    it("should render auto stake maturity action for hardware wallet", () => {
      const { container } = render(NeuronContextActionsTest, {
        props: {
          neuron: neuronHW,
          testComponent: NnsNeuronMaturityCard,
        },
      });

      expect(
        container.querySelector("#auto-stake-maturity-checkbox")
      ).toBeInTheDocument();
    });

    it("should render stake maturity description", () => {
      const { getByTestId } = render(NeuronContextActionsTest, {
        props: {
          neuron: neuronHW,
          testComponent: NnsNeuronMaturityCard,
        },
      });

      const div = document.createElement("div");
      div.innerHTML = en.neuron_detail.stake_maturity_tooltip;

      expect(getByTestId("maturity-description")?.textContent?.trim()).toEqual(
        div.textContent.trim()
      );
    });
  });
});
