/**
 * @jest-environment jsdom
 */

import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/IncreaseSnsDissolveDelayModal.svelte";
import { updateDelay } from "$lib/services/sns-neurons.services";
import { page } from "$mocks/$app/stores";
import { ICPToken } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { fireEvent } from "@testing-library/dom";
import { waitFor, type RenderResult } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    updateDelay: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("IncreaseSnsDissolveDelayModal", () => {
  const reloadNeuron = jest.fn().mockResolvedValue(undefined);
  const renderIncreaseDelayModal = async (
    neuron: SnsNeuron
  ): Promise<RenderResult> => {
    return renderModal({
      component: IncreaseSnsDissolveDelayModal,
      props: { neuron, token: ICPToken, reloadNeuron },
    });
  };

  beforeAll(() => {
    page.mock({ data: { universe: mockPrincipal.toText() } });
  });

  beforeEach(reloadNeuron.mockClear);

  it("should display modal", async () => {
    const { container } = await renderIncreaseDelayModal(mockSnsNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the update delay button disabled by default", async () => {
    const { container } = await renderIncreaseDelayModal(mockSnsNeuron);

    const updateDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should be able to change dissolve delay in the confirmation screen", async () => {
    const { container } = await renderIncreaseDelayModal(mockSnsNeuron);

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

    expect(goToConfirmDelayButton).toBeDefined();

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

    expect(confirmButton).toBeDefined();

    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() => expect(updateDelay).toBeCalled());
  });
});
