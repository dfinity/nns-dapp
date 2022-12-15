/**
 * @jest-environment jsdom
 */

import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsIncreaseStakeNeuronModal from "$lib/modals/sns/neurons/SnsIncreaseStakeNeuronModal.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { increaseStakeNeuron } from "$lib/services/sns-neurons.services";
import { authStore } from "$lib/stores/auth.store";
import * as busyStore from "$lib/stores/busy.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { ICPToken } from "@dfinity/nns";
import {
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../../mocks/auth.store.mock";
import { mockStoreSubscribe } from "../../../mocks/commont.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsAccountsStoreSubscribe } from "../../../mocks/sns-accounts.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "../../../mocks/transaction-fee.mock";
import {
  AMOUNT_INPUT_SELECTOR,
  enterAmount,
} from "../../../utils/neurons-modal.test-utils";
import {startBusy, stopBusy} from "$lib/stores/busy.store";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    increaseStakeNeuron: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/stores/busy.store", () => {
  return {
    startBusy: jest.fn(),
    stopBusy:  jest.fn(),
  };
});

describe("SnsIncreaseStakeNeuronModal", () => {
  const reloadNeuron = jest.fn();

  const props = {
    neuronId: mockSnsNeuron.id,
    rootCanisterId: mockPrincipal,
    token: ICPToken,
    reloadNeuron,
  };

  const renderSnsIncreaseStakeNeuronModal = async (): Promise<
    RenderResult<SvelteComponent>
  > => {
    return renderModal({
      component: SnsIncreaseStakeNeuronModal,
      props,
    });
  };

  describe("accounts and params are not loaded", () => {
    it("should not display modal", async () => {
      const { container } = await render(SnsIncreaseStakeNeuronModal, {
        props,
      });

      expect(container.querySelector("div.modal")).toBeNull();
    });

    it("should call sync sns accounts on init", async () => {
      await render(SnsIncreaseStakeNeuronModal, {
        props,
      });

      expect(syncSnsAccounts).toBeCalled();
    });

    it("should display a spinner on init", async () => {
      await render(SnsIncreaseStakeNeuronModal, {
        props,
      });

      expect(startBusy).toHaveBeenCalled()
    });
  });

  describe("accounts and params are loaded", () => {
    beforeAll(() => {
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      jest
        .spyOn(snsSelectedTransactionFeeStore, "subscribe")
        .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());
    });

    it("should display modal", async () => {
      const { container } = await renderSnsIncreaseStakeNeuronModal();

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    describe("user has not signed-in", () => {
      it("should not be able to execute transaction", async () => {
        const renderResult: RenderResult<SvelteComponent> =
          await renderSnsIncreaseStakeNeuronModal();

        await enterAmount(renderResult);

        const { getByTestId } = renderResult;

        expect(() => getByTestId("transaction-button-execute")).toThrow();
        expect(getByTestId("login-button")).toBeTruthy();
      });
    });

    describe("user has signed-in", () => {
      beforeAll(() => {
        jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreSubscribe);
      });

      it("should call increaseStakeNeuron service on confirm click", async () => {
        const renderResult: RenderResult<SvelteComponent> =
          await renderSnsIncreaseStakeNeuronModal();

        await enterAmount(renderResult);

        const { getByTestId } = renderResult;

        const confirmButton = getByTestId("transaction-button-execute");
        fireEvent.click(confirmButton);

        expect(increaseStakeNeuron).toBeCalled();
      });

      it("should go back in modal on cancel click", async () => {
        const renderResult: RenderResult<SvelteComponent> =
          await renderSnsIncreaseStakeNeuronModal();

        await enterAmount(renderResult);

        const { queryByTestId, container } = renderResult;

        await waitFor(() =>
          expect(queryByTestId("transaction-button-back")).toBeInTheDocument()
        );

        const cancelButton = queryByTestId("transaction-button-back");
        expect(cancelButton).toBeInTheDocument();
        cancelButton && (await fireEvent.click(cancelButton));

        await waitFor(() =>
          expect(container.querySelector(AMOUNT_INPUT_SELECTOR)).not.toBeNull()
        );
      });
    });
  });
});
