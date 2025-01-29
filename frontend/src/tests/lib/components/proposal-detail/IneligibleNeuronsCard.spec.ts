import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { secondsToRoundedDuration } from "$lib/utils/date.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import type { IneligibleNeuronData } from "$lib/utils/neuron.utils";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("IneligibleNeuronsCard", () => {
  it("should be hidden if no neurons", () => {
    const { queryByTestId } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [],
        minSnsDissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      },
    });
    expect(queryByTestId("neuron-card")).not.toBeInTheDocument();
  });

  it("should display description text", () => {
    const { getByTestId } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [
          {
            neuronIdString: "123",
            reason: "short",
          },
        ] as IneligibleNeuronData[],
        minSnsDissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      },
    });
    expect(getByTestId("ineligible-neurons-description")).toBeInTheDocument();
    expect(getByTestId("ineligible-neurons-description").textContent).toEqual(
      "The following neurons are not eligible to vote. They either have dissolve delays of less than 6 months at the time when the proposal was submitted, or they were created after the proposal was submitted."
    );
  });

  it("should display description text for not default dissolve delay", () => {
    const { getByTestId } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [
          {
            neuronIdString: "123",
            reason: "short",
          },
        ] as IneligibleNeuronData[],
        minSnsDissolveDelaySeconds: BigInt(
          NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE * 20
        ),
      },
    });
    expect(getByTestId("ineligible-neurons-description").textContent).toEqual(
      "The following neurons are not eligible to vote. They either have dissolve delays of less than 10 years at the time when the proposal was submitted, or they were created after the proposal was submitted."
    );
  });

  it("should display ineligible neurons with reason 'short'", () => {
    const { getByText } = render(IneligibleNeuronsCard, {
      props: {
        ineligibleNeurons: [
          {
            neuronIdString: "123",
            reason: "short",
          },
        ] as IneligibleNeuronData[],
        minSnsDissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      },
    });
    expect(getByText("123", { exact: false })).toBeInTheDocument();
    expect(
      getByText(
        replacePlaceholders(en.proposal_detail__ineligible.reason_short, {
          $minDissolveDelay: secondsToRoundedDuration(
            BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE)
          ),
        }),
        { exact: false }
      )
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
      minSnsDissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    });
    expect(getByText("111", { exact: false })).toBeInTheDocument();
    expect(
      (container.querySelector("small") as HTMLElement).textContent
    ).toEqual(en.proposal_detail__ineligible.reason_since);
  });

  it("should display ineligible neurons due to reason 'no-permission'", () => {
    const { getByText, container } = render(IneligibleNeuronsCard, {
      ineligibleNeurons: [
        {
          neuronIdString: "111",
          reason: "no-permission",
        },
      ] as IneligibleNeuronData[],
      minSnsDissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    });
    expect(getByText("111", { exact: false })).toBeInTheDocument();
    expect(
      (container.querySelector("small") as HTMLElement).textContent
    ).toEqual(en.proposal_detail__ineligible.reason_no_permission);
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
        minSnsDissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
      },
    });
    expect(container.querySelectorAll("li").length).toBe(2);
    expect(
      (container.querySelector("small") as HTMLElement).textContent
    ).toEqual(en.proposal_detail__ineligible.reason_since);
    expect(
      getByText(
        replacePlaceholders(en.proposal_detail__ineligible.reason_short, {
          $minDissolveDelay: secondsToRoundedDuration(
            BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE)
          ),
        }),
        { exact: false }
      )
    ).toBeInTheDocument();
  });
});
