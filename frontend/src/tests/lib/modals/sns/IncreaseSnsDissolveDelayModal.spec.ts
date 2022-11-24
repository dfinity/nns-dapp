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
import {mockSnsNeuron, snsNervousSystemParametersMock} from "../../../mocks/sns-neurons.mock";
import {snsParametersStore} from "$lib/stores/sns-parameters.store";
import {syncSnsParameters} from "$lib/services/sns-parameters.services";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    updateDelay: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/services/sns-parameters.services", () => {
  return {
    syncSnsParameters: jest.fn().mockResolvedValue(undefined),
  };
});


describe("IncreaseSnsDissolveDelayModal", () => {
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    dissolve_state: [
      {
        DissolveDelaySeconds: 0n,
      },
    ],
  };
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

    snsParametersStore.setParameters({
      certified: true,
      rootCanisterId: mockPrincipal,
      parameters: snsNervousSystemParametersMock,
    });
  });

  beforeEach(reloadNeuron.mockClear);

  afterAll(() => {
    snsParametersStore.reset();
  });

  it("should display modal", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the update delay button disabled by default", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

    const updateDelayButton = container.querySelector(
      '[data-tid="go-confirm-delay-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should be able to change dissolve delay in the confirmation screen", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

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

  it("should trigger `syncSnsParameters`", async () => {
    await renderIncreaseDelayModal(neuron);

    expect(syncSnsParameters).toBeCalled();
  });
});
