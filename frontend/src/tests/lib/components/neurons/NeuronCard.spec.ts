/**
 * @jest-environment jsdom
 */

import NeuronCard from "$lib/components/neurons/NeuronCard.svelte";
import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import { formatToken } from "$lib/utils/token.utils";
import type { Neuron } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronCard", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("renders a Card", () => {
    const { container } = render(NeuronCard, {
      props: { neuron: mockNeuron },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement).not.toBeNull();
  });

  it("is clickable", async () => {
    const spyClick = jest.fn();
    const { container, component } = render(NeuronCard, {
      props: {
        neuron: mockNeuron,
      },
    });
    component.$on("click", spyClick);

    const articleElement = container.querySelector("article");

    articleElement && (await fireEvent.click(articleElement));

    expect(spyClick).toBeCalled();
  });

  it("renders role and aria-label passed", async () => {
    const role = "link";
    const ariaLabel = "test label";
    const { container } = render(NeuronCard, {
      props: {
        neuron: mockNeuron,
        role,
        ariaLabel,
      },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement?.getAttribute("role")).toBe(role);
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("renders the neuron stake and identifier", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: mockNeuron,
      },
    });

    const stakeText = formatToken({
      value:
        (mockNeuron.fullNeuron as Neuron).cachedNeuronStake -
        (mockNeuron.fullNeuron as Neuron).neuronFees,
      detailed: true,
    });
    expect(getByText(stakeText)).toBeInTheDocument();
    expect(getByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
  });

  it("doesn't render the neuron stake but the stacked line chart icon", async () => {
    const neuron = {
      ...mockNeuron,
      state: NeuronState.Spawning,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        spawnAtTimesSeconds: BigInt(3600 * 24 * 6 + 3600 * 4),
      },
    };
    const { queryByTestId } = render(NeuronCard, {
      props: {
        neuron,
      },
    });

    expect(queryByTestId("stacked-line-chart")).toBeInTheDocument();
  });

  it("renders the community fund label when neuron part of community fund", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          joinedCommunityFundTimestampSeconds: BigInt(1000),
        },
      },
    });

    expect(getByText(en.neurons.community_fund)).toBeInTheDocument();
  });

  it("renders the hotkey_control label when neuron is not controlled by current user but by hotkey", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            hotKeys: [mockIdentity.getPrincipal().toText()],
            controller: "bbbbb-bb",
          },
        },
      },
    });

    expect(getByText(en.neurons.hotkey_control)).toBeInTheDocument();
  });

  it("renders proper text when status is LOCKED", async () => {
    const MORE_THAN_ONE_YEAR = 60 * 60 * 24 * 365 * 1.5;
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          dissolveDelaySeconds: BigInt(MORE_THAN_ONE_YEAR),
          state: NeuronState.Locked,
        },
      },
    });

    expect(getByText(en.neuron_state.Locked)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVED", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.Dissolved,
        },
      },
    });

    expect(getByText(en.neuron_state.Dissolved)).toBeInTheDocument();
  });

  it("renders proper text when status is SPAWNING", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.Spawning,
          fullNeuron: {
            ...mockFullNeuron,
            spawnAtTimesSeconds: BigInt(3600 * 24 * 6 + 3600 * 4),
          },
        },
      },
    });

    expect(getByText(en.neuron_state.Spawning)).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVING", async () => {
    const ONE_YEAR_FROM_NOW = SECONDS_IN_YEAR + Math.round(Date.now() / 1000);
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.Dissolving,
          fullNeuron: {
            ...mockFullNeuron,
            dissolveState: {
              WhenDissolvedTimestampSeconds: BigInt(ONE_YEAR_FROM_NOW),
            },
          },
        },
      },
    });

    expect(getByText(en.neuron_state.Dissolving)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders voting power in `proposerNeuron` version", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: mockNeuron,
        proposerNeuron: true,
      },
    });
    const votingValue = formatToken({
      value: mockNeuron.votingPower,
      detailed: true,
    });
    expect(getByText(votingValue)).toBeInTheDocument();
  });
});
