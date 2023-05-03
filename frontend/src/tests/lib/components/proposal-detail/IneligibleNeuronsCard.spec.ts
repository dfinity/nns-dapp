/**
 * @jest-environment jsdom
 */
import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
import type { IneligibleNeuronData } from "$lib/utils/neuron.utils";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("IneligibleNeuronsCard", () => {
  it("should be hidden if no neurons", () => {
    const { queryByTestId } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [],
      },
    });
    expect(queryByTestId("neuron-card")).not.toBeInTheDocument();
  });

  it("should display texts", () => {
    const { getByText } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [
          {
            neuronIdString: "123",
            reason: "short",
          },
        ] as IneligibleNeuronData[],
      },
    });
    expect(
      getByText(en.proposal_detail__ineligible.headline)
    ).toBeInTheDocument();
    expect(getByText(en.proposal_detail__ineligible.text)).toBeInTheDocument();
  });

  it("should display ineligible neurons (< 6 months) ", () => {
    const { getByText } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [
          {
            neuronIdString: "123",
            reason: "short",
          },
        ] as IneligibleNeuronData[],
      },
    });
    expect(getByText("123", { exact: false })).toBeInTheDocument();
    expect(
      getByText(en.proposal_detail__ineligible.reason_short, { exact: false })
    ).toBeInTheDocument();
  });

  it("should display ineligible neurons (created after proposal) ", () => {
    const { getByText, container } = render(IneligibleNeuronsCard, {
      ineligibleNeurons: [
        {
          neuronIdString: "111",
          reason: "since",
        },
      ] as IneligibleNeuronData[],
    });
    expect(getByText("111", { exact: false })).toBeInTheDocument();
    expect(
      (container.querySelector("small") as HTMLElement).textContent
    ).toEqual(en.proposal_detail__ineligible.reason_since);
  });

  it("should display multiple ineligible neurons", () => {
    const { container, getByText } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [
          {
            neuronIdString: "111",
            reason: "since",
          },
          {
            neuronIdString: "222",
            reason: "short",
          },
        ] as IneligibleNeuronData[],
      },
    });
    expect(container.querySelectorAll("li").length).toBe(2);
    expect(
      (container.querySelector("small") as HTMLElement).textContent
    ).toEqual(en.proposal_detail__ineligible.reason_since);
    expect(
      getByText(en.proposal_detail__ineligible.reason_short, { exact: false })
    ).toBeInTheDocument();
  });
});
