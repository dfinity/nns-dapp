import NnsAutoStakeMaturity from "$lib/components/neuron-detail/actions/NnsAutoStakeMaturity.svelte";
import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { toastsStore } from "@dfinity/gix-components";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { vi } from "vitest";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    toggleAutoStakeMaturity: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("NnsAutoStakeMaturity", () => {
  afterEach(() => {
    vi.clearAllMocks();
    toastsStore.reset();
  });

  it("renders checkbox", () => {
    const neuron = {
      ...mockNeuron,
    };
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsAutoStakeMaturity,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  const neuronProps = (autoStakeMaturity: boolean | undefined) => ({
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      autoStakeMaturity,
    },
  });

  const testCheckBox = (autoStakeMaturity: boolean | undefined) => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: neuronProps(autoStakeMaturity),
        testComponent: NnsAutoStakeMaturity,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    if (autoStakeMaturity === true) {
      expect(inputElement.checked).toBeTruthy();
      return;
    }

    expect(inputElement.checked).toBe(false);
  };

  it("renders checked if auto stake already on", () => testCheckBox(true));

  it("renders unchecked if auto stake already false", () =>
    testCheckBox(false));

  it("renders unchecked if auto stake is undefined", () =>
    testCheckBox(undefined));

  it("renders a disabled checkbox if neuron is not controllable", async () => {
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-user",
        autoStakeMaturity: true,
      },
    };
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsAutoStakeMaturity,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    expect(inputElement.checked).toBeTruthy();
    expect(inputElement.disabled).toBeTruthy();
  });

  const toggleAutoStake = async ({
    neuronAutoStakeMaturity,
  }: {
    neuronAutoStakeMaturity: boolean | undefined;
  }) => {
    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: neuronProps(neuronAutoStakeMaturity),
        testComponent: NnsAutoStakeMaturity,
      },
    });

    const inputElement = container.querySelector("input[type='checkbox']");
    expect(inputElement).not.toBeNull();

    inputElement && (await fireEvent.click(inputElement));

    const modal = queryByTestId("auto-stake-confirm-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
  };

  it("should call toggleAutoStakeMaturity neuron service on confirmation", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: undefined });
    expect(toggleAutoStakeMaturity).toBeCalled();
  });

  it("should show success message when enabling", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: undefined });
    expect(get(toastsStore)[0]).toMatchObject({
      level: "success",
      text: en.neuron_detail.auto_stake_maturity_on_success,
    });
  });

  it("should show success message when disabling", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: true });
    expect(get(toastsStore)[0]).toMatchObject({
      level: "success",
      text: en.neuron_detail.auto_stake_maturity_off_success,
    });
  });
});
