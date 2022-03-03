/**
 * @jest-environment jsdom
 */

import { NeuronState } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronCard from "../../../../lib/components/neurons/NeuronCard.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { fullNeuronMock, neuronMock } from "../../../mocks/neurons.mock";

const en = require("../../../../lib/i18n/en.json");

describe("NeuronCard", () => {
  it("renders a Card", () => {
    const { container } = render(NeuronCard, {
      props: { neuron: neuronMock },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement).not.toBeNull();
  });

  it("is clickable", async () => {
    const spyClick = jest.fn();
    const { container, component } = render(NeuronCard, {
      props: {
        neuron: neuronMock,
      },
    });
    component.$on("click", spyClick);

    const articleElement = container.querySelector("article");

    await fireEvent.click(articleElement);

    expect(spyClick).toBeCalled();
  });

  it("renders role and aria-label passed", async () => {
    const role = "link";
    const ariaLabel = "test label";
    const { container } = render(NeuronCard, {
      props: {
        neuron: neuronMock,
        role,
        ariaLabel,
      },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement.getAttribute("role")).toBe(role);
    expect(articleElement.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("renders the neuron stake and identifier", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: neuronMock,
      },
    });

    const stakeText = formatICP(neuronMock.fullNeuron.cachedNeuronStake);
    expect(getByText(stakeText)).toBeInTheDocument();
    expect(getByText(neuronMock.neuronId.toString())).toBeInTheDocument();
  });

  it("renders the community fund label when neuron part of community fund", async () => {
    const { getByText } = render(NeuronCard, {
      props: {
        neuron: {
          ...neuronMock,
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
          ...neuronMock,
          fullNeuron: { ...fullNeuronMock, isCurrentUserController: false },
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
          ...neuronMock,
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
          ...neuronMock,
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
          ...neuronMock,
          state: NeuronState.DISSOLVING,
          fullNeuron: {
            ...fullNeuronMock,
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
