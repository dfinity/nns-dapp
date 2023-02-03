/**
 * @jest-environment jsdom
 */

import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/neurons/IncreaseSnsDissolveDelayModal.svelte";
import { updateDelay } from "$lib/services/sns-neurons.services";
import { loadSnsParameters } from "$lib/services/sns-parameters.services";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { daysToSeconds, secondsToDays } from "$lib/utils/date.utils";
import { page } from "$mocks/$app/stores";
import { ICPToken } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { fireEvent } from "@testing-library/dom";
import { waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "../../../mocks/sns-neurons.mock";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    updateDelay: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/services/sns-parameters.services", () => {
  return {
    loadSnsParameters: jest.fn().mockResolvedValue(undefined),
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
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: IncreaseSnsDissolveDelayModal,
      props: {
        rootCanisterId: mockPrincipal,
        neuron,
        token: ICPToken,
        reloadNeuron,
      },
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

  it("should be able to change dissolve delay in the confirmation screen using range", async () => {
    const { container } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector('input[type="range"]');
    expect(inputRange).not.toBeNull();

    inputRange &&
      (await fireEvent.input(inputRange, {
        target: { value: Math.round(secondsToDays(SECONDS_IN_YEAR * 2)) },
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

  it("should be able to change dissolve delay in the confirmation screen using input", async () => {
    const { container, queryByTestId } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(queryByTestId("input-ui-element")).toBeInTheDocument()
    );

    const dissolveDelaySeconds = daysToSeconds(
      secondsToDays(SECONDS_IN_YEAR * 2)
    );
    const inputElement = queryByTestId("input-ui-element");

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: `${Math.round(secondsToDays(dissolveDelaySeconds))}` },
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
    await waitFor(() =>
      expect(updateDelay).toBeCalledWith(
        expect.objectContaining({
          dissolveDelaySeconds,
        })
      )
    );
  });

  it("should be able to set minimum by clicking on min button", async () => {
    const { queryByTestId } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(queryByTestId("min-button")).toBeInTheDocument()
    );

    const minButton = queryByTestId("min-button");
    const inputElement = queryByTestId("input-ui-element");

    const minValue = fromDefinedNullable(
      snsNervousSystemParametersMock.neuron_minimum_dissolve_delay_to_vote_seconds
    );

    await fireEvent.click(minButton);

    await waitFor(() =>
      expect((inputElement as HTMLInputElement).value).toEqual(
        `${secondsToDays(Number(minValue))}`
      )
    );
  });

  it("should be able to set maximum by clicking on max button", async () => {
    const { queryByTestId } = await renderIncreaseDelayModal(neuron);

    await waitFor(() =>
      expect(queryByTestId("max-button")).toBeInTheDocument()
    );

    const maxValue = fromDefinedNullable(
      snsNervousSystemParametersMock.max_dissolve_delay_seconds
    );
    const maxButton = queryByTestId("max-button");
    const inputElement = queryByTestId("input-ui-element");

    await fireEvent.click(maxButton);

    await waitFor(() =>
      expect((inputElement as HTMLInputElement).value).toEqual(
        `${secondsToDays(Number(maxValue))}`
      )
    );
  });

  it("should trigger `loadSnsParameters`", async () => {
    await renderIncreaseDelayModal(neuron);

    expect(loadSnsParameters).toBeCalled();
  });
});
