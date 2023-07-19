import JoinCommunityFundCheckbox from "$lib/components/neuron-detail/actions/JoinCommunityFundCheckbox.svelte";
import { toggleCommunityFund } from "$lib/services/neurons.services";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    toggleCommunityFund: vi.fn().mockResolvedValue(undefined),
  };
});

describe("JoinCommunityFundCheckbox", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders checkbox", () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
    };

    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: JoinCommunityFundCheckbox,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders checked if neuron is part of the fund", () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: BigInt(1200),
    };

    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: JoinCommunityFundCheckbox,
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

    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: JoinCommunityFundCheckbox,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;
    expect(inputElement.checked).toBe(false);
  });

  it("allows neuron to join community fund", async () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: undefined,
    };

    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: JoinCommunityFundCheckbox,
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

  it("allows neuron to leave community fund", async () => {
    const neuron = {
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: BigInt(10),
    };

    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: JoinCommunityFundCheckbox,
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
