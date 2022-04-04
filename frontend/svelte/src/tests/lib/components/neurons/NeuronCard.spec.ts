/**
 * @jest-environment jsdom
 */

import type { Neuron } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronCard from "../../../../lib/components/neurons/NeuronCard.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronCard", () => {
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

    const stakeText = formatICP(
      (mockNeuron.fullNeuron as Neuron).cachedNeuronStake -
        (mockNeuron.fullNeuron as Neuron).neuronFees
    );
    expect(getByText(stakeText)).toBeInTheDocument();
    expect(getByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
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

  it("renders the hotkey_control label when neuron is not controlled by current user", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: { ...mockFullNeuron, isCurrentUserController: false },
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
          state: NeuronState.LOCKED,
        },
      },
    });

    expect(getByText(en.neurons.status_locked)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVED", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.DISSOLVED,
        },
      },
    });

    expect(getByText(en.neurons.status_dissolved)).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVING", async () => {
    const MORE_THAN_ONE_YEAR = 60 * 60 * 24 * 365 * 1.5;
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.DISSOLVING,
          fullNeuron: {
            ...mockFullNeuron,
            dissolveState: {
              WhenDissolvedTimestampSeconds: BigInt(MORE_THAN_ONE_YEAR),
            },
          },
        },
      },
    });

    expect(getByText(en.neurons.status_dissolving)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });
});
