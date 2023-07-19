import NnsNeuronMaturityCard from "$lib/components/neuron-detail/NnsNeuronMaturityCard.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import {
  formattedStakedMaturity,
  formattedTotalMaturity,
} from "$lib/utils/neuron.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { NnsNeuronMaturityCardPo } from "$tests/page-objects/NnsNeuronMaturityCard.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
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
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe)
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
      vi
        .spyOn(icpAccountsStore, "subscribe")
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

  describe("last maturity distribution", () => {
    beforeEach(() => {
      nnsLatestRewardEventStore.reset();
    });

    it("should render last maturity distribution if present in store", async () => {
      const rewardEvent = {
        ...mockRewardEvent,
        actual_timestamp_seconds: BigInt(
          new Date("1992-05-22T21:00:00").getTime() / 1000
        ),
        rounds_since_last_distribution: [3n] as [bigint],
      };
      nnsLatestRewardEventStore.setLatestRewardEvent({
        rewardEvent,
        certified: true,
      });

      const { container } = render(NeuronContextActionsTest, {
        props: {
          neuron,
          testComponent: NnsNeuronMaturityCard,
        },
      });

      const po = NnsNeuronMaturityCardPo.under(
        new VitestPageObjectElement(container)
      );

      expect(await po.getLastDistributionMaturity()).toEqual("May 19, 1992");
      expect(await po.getLastDistributionMaturityDescription()).toEqual(
        "On a day with no settled proposals, no rewards are distributed; rather rewards will roll over to the following day. The last distribution date is the last time rewards were distributed. Learn more"
      );
    });

    it("should not render last maturity distribution if not in store", async () => {
      const { queryByTestId } = render(NeuronContextActionsTest, {
        props: {
          neuron,
          testComponent: NnsNeuronMaturityCard,
        },
      });

      expect(
        queryByTestId("last-distribution-maturity")
      ).not.toBeInTheDocument();
    });
  });
});
