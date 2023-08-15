/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import SnsIncreaseStakeNeuronModal from "$lib/modals/sns/neurons/SnsIncreaseStakeNeuronModal.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { increaseStakeNeuron } from "$lib/services/sns-neurons.services";
import { startBusy } from "$lib/stores/busy.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { page } from "$mocks/$app/stores";
import {
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  AMOUNT_INPUT_SELECTOR,
  enterAmount,
} from "$tests/utils/neurons-modal.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { ICPToken } from "@dfinity/utils";
import {
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

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
    stopBusy: jest.fn(),
  };
});

describe("SnsIncreaseStakeNeuronModal", () => {
  const reloadNeuron = jest.fn();
  const rootCanisterId = mockPrincipal;
  const snsProjectParams = {
    lifecycle: SnsSwapLifecycle.Committed,
    rootCanisterId,
  };

  const props = {
    neuronId: mockSnsNeuron.id[0],
    rootCanisterId,
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

  beforeEach(() => {
    page.mock({
      routeId: AppPath.Neuron,
      data: { universe: rootCanisterId.toText() },
    });
    setSnsProjects([snsProjectParams]);
    jest.clearAllMocks();
  });

  describe("accounts and params are not loaded", () => {
    beforeEach(() => {
      snsAccountsStore.reset();
      transactionsFeesStore.reset();
    });

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

      expect(startBusy).toHaveBeenCalled();
    });
  });

  describe("accounts and params are loaded", () => {
    beforeEach(() => {
      snsAccountsStore.setAccounts({
        rootCanisterId,
        accounts: [mockSnsMainAccount],
        certified: true,
      });
      transactionsFeesStore.setFee({
        rootCanisterId,
        fee: 10_000n,
        certified: true,
      });
    });

    it("should display modal", async () => {
      const { container } = await renderSnsIncreaseStakeNeuronModal();

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    describe("user has not signed-in", () => {
      beforeEach(() => {
        setNoIdentity();
      });

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
      beforeEach(() => {
        resetIdentity();
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
