/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import SnsNeuronCard from "../../../../lib/components/sns-neurons/SnsNeuronCard.svelte";
import { SECONDS_IN_YEAR } from "../../../../lib/constants/constants";
import { nowInSeconds } from "../../../../lib/utils/date.utils";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { getSnsNeuronId } from "../../../../lib/utils/sns-neuron.utils";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("SnsNeuronCard", () => {
  const defaultProps = {
    role: "link",
    ariaLabel: "test label",
  };
  it("renders a Card", () => {
    const { container } = render(SnsNeuronCard, {
      props: { neuron: mockSnsNeuron, ...defaultProps },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement).not.toBeNull();
  });

  it("is clickable", async () => {
    const spyClick = jest.fn();
    const { container, component } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        ...defaultProps,
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
    const { container } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        role,
        ariaLabel,
      },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement?.getAttribute("role")).toBe(role);
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("renders the neuron stake and identifier", async () => {
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        ...defaultProps,
      },
    });

    const stakeText = formatICP({
      value:
        mockSnsNeuron.cached_neuron_stake_e8s - mockSnsNeuron.neuron_fees_e8s,
      detailed: true,
    });
    expect(getByText(stakeText)).toBeInTheDocument();
    expect(getByText(getSnsNeuronId(mockSnsNeuron))).toBeInTheDocument();
  });

  it("renders proper text when status is LOCKED", async () => {
    const MORE_THAN_ONE_YEAR = 60 * 60 * 24 * 365 * 1.5;
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [
            {
              DissolveDelaySeconds:
                BigInt(nowInSeconds()) + BigInt(MORE_THAN_ONE_YEAR),
            },
          ],
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neurons.status_locked)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVED", async () => {
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [],
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neurons.status_dissolved)).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVING", async () => {
    const ONE_YEAR_FROM_NOW = SECONDS_IN_YEAR + Math.round(Date.now() / 1000);
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [
            {
              WhenDissolvedTimestampSeconds: BigInt(ONE_YEAR_FROM_NOW),
            },
          ],
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neurons.status_dissolving)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });
});
