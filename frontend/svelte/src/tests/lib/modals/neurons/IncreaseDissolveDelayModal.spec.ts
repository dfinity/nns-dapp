/**
 * @jest-environment jsdom
 */

import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import { SECONDS_IN_YEAR } from "../../../../lib/constants/constants";
import IncreaseDissolveDelayModal from "../../../../lib/modals/neurons/IncreaseDissolveDelayModal.svelte";
import { updateDelay } from "../../../../lib/services/neurons.services";
import { waitModalIntroEnd } from "../../../mocks/modal.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    updateDelay: jest.fn().mockResolvedValue(undefined),
  };
});

describe("IncreaseDissolveDelayModal", () => {
  const modalTitleSelector = "h3";

  const renderModal = async (neuron: NeuronInfo): Promise<RenderResult> => {
    const modal = render(IncreaseDissolveDelayModal, { neuron });

    const { container } = modal;
    await waitModalIntroEnd({ container, selector: modalTitleSelector });

    return modal;
  };

  it("should display modal", async () => {
    const { container } = await renderModal(mockNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the update delay button disabled by default", async () => {
    const { container } = await renderModal(mockNeuron);

    const updateDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should be able to change dissolve delay in the confirmation screen", async () => {
    const editableNeuron = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    };
    const { container } = await renderModal(editableNeuron);

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector('input[type="range"]');
    expect(inputRange).not.toBeNull();

    inputRange &&
      (await fireEvent.input(inputRange, {
        target: { value: SECONDS_IN_YEAR * 2 },
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
    const editableNeuron = {
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    };
    const { container } = await renderModal(editableNeuron);

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector<HTMLInputElement>(
      'input[type="range"]'
    );
    expect(inputRange).not.toBeNull();

    inputRange &&
      (await fireEvent.input(inputRange, {
        target: { value: SECONDS_IN_YEAR / 2 },
      }));

    const goToConfirmDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    await waitFor(() =>
      expect(goToConfirmDelayButton?.getAttribute("disabled")).not.toBeNull()
    );
    inputRange &&
      (await waitFor(() =>
        expect(inputRange.value).toBe(String(SECONDS_IN_YEAR))
      ));
  });
});
