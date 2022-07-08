/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import JoinCommunityFundCheckbox from "../../../../../lib/components/neuron-detail/actions/JoinCommunityFundCheckbox.svelte";
import { toggleCommunityFund } from "../../../../../lib/services/neurons.services";
import { mockNeuron } from "../../../../mocks/neurons.mock";

jest.mock("../../../../../lib/services/neurons.services", () => {
  return {
    toggleCommunityFund: jest.fn().mockResolvedValue(undefined),
  };
});

describe("JoinCommunityFundCheckbox", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders checkbox", () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
    };
    const { queryByTestId } = render(JoinCommunityFundCheckbox, {
      props: {
        neuron,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders checked checkbox if neuron is part of the fund", () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: BigInt(1200),
    };
    const { queryByTestId } = render(JoinCommunityFundCheckbox, {
      props: {
        neuron,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;
    expect(inputElement.checked).toBeTruthy();
  });

  it("renders unchecked checkbox if neuron is not part of the fund", () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
    };
    const { queryByTestId } = render(JoinCommunityFundCheckbox, {
      props: {
        neuron,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;
    expect(inputElement.checked).toBeFalsy();
  });

  it("allows neuron to toggle community fund", async () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
    };
    const { container, queryByTestId } = render(JoinCommunityFundCheckbox, {
      props: {
        neuron,
      },
    });

    const inputElement = container.querySelector("input[type='checkbox']");

    expect(inputElement).not.toBeNull();

    inputElement && (await fireEvent.click(inputElement));

    const modal = queryByTestId("join-community-fund-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(toggleCommunityFund).toBeCalled();
  });
});
