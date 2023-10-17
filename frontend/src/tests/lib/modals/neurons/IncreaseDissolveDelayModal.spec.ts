import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "$lib/constants/constants";
import IncreaseDissolveDelayModal from "$lib/modals/neurons/IncreaseDissolveDelayModal.svelte";
import { updateDelay } from "$lib/services/neurons.services";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    updateDelay: vi.fn().mockResolvedValue(undefined),
    getNeuronFromStore: vi.fn(),
  };
});

describe("IncreaseDissolveDelayModal", () => {
  const renderIncreaseDelayModal = async (
    neuron: NeuronInfo
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: IncreaseDissolveDelayModal,
      props: { neuron },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderIncreaseDelayModal(mockNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the update delay button disabled by default", async () => {
    const { container } = await renderIncreaseDelayModal({
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(365 * SECONDS_IN_DAY),
    });

    const updateDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have the update delay button enabled if the current delay is not a whole number of days", async () => {
    const { container } = await renderIncreaseDelayModal({
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(365.25 * SECONDS_IN_DAY),
    });

    const updateDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).toBeNull();
  });

  it("should be able to change dissolve delay in the confirmation screen", async () => {
    const editableNeuron = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    };
    const { container } = await renderIncreaseDelayModal(editableNeuron);

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector('input[type="range"]');
    expect(inputRange).not.toBeNull();

    inputRange &&
      (await fireEvent.input(inputRange, {
        target: { value: 365 * 2 },
      }));

    const goToConfirmDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    await waitFor(() =>
      expect(goToConfirmDelayButton?.getAttribute("disabled")).toBeNull()
    );

    goToConfirmDelayButton && (await fireEvent.click(goToConfirmDelayButton));

    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-dissolve-delay-container"]')
      ).not.toBeNull()
    );

    const confirmButton = container.querySelector(
      '[data-tid="confirm-delay-button"]'
    );
    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() => expect(updateDelay).toBeCalled());
  });

  it("should not be able to change dissolve delay below current value", async () => {
    const currentNeuronDissoveDelayDays = 366;
    const editableNeuron = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(
        currentNeuronDissoveDelayDays * SECONDS_IN_DAY
      ),
    };
    const { container } = await renderIncreaseDelayModal(editableNeuron);

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector<HTMLInputElement>(
      'input[type="range"]'
    );
    expect(inputRange).not.toBeNull();

    inputRange &&
      (await fireEvent.input(inputRange, {
        target: { value: currentNeuronDissoveDelayDays / 2 },
      }));

    const goToConfirmDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );

    await waitFor(() =>
      expect(goToConfirmDelayButton?.getAttribute("disabled")).not.toBeNull()
    );
    inputRange &&
      (await waitFor(() =>
        expect(inputRange.value).toBe(String(currentNeuronDissoveDelayDays))
      ));
  });
});
