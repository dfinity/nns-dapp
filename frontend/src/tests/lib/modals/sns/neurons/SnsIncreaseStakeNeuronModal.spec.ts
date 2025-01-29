import { AppPath } from "$lib/constants/routes.constants";
import SnsIncreaseStakeNeuronModal from "$lib/modals/sns/neurons/SnsIncreaseStakeNeuronModal.svelte";
import * as snsAccountsServices from "$lib/services/sns-accounts.services";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { increaseStakeNeuron } from "$lib/services/sns-neurons.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { page } from "$mocks/$app/stores";
import {
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import {
  AMOUNT_INPUT_SELECTOR,
  enterAmount,
} from "$tests/utils/neurons-modal.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { ICPToken } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { Component } from "svelte";

describe("SnsIncreaseStakeNeuronModal", () => {
  const reloadNeuron = vi.fn();
  const rootCanisterId = mockPrincipal;
  const ledgerCanisterId = principal(2);
  const snsProjectParams = {
    lifecycle: SnsSwapLifecycle.Committed,
    rootCanisterId,
    ledgerCanisterId,
    tokenMetadata: mockSnsToken,
  };

  const props = {
    neuronId: mockSnsNeuron.id[0],
    rootCanisterId,
    token: ICPToken,
    reloadNeuron,
  };

  const renderSnsIncreaseStakeNeuronModal = async (): Promise<
    RenderResult<Component>
  > => {
    return renderModal({
      component: SnsIncreaseStakeNeuronModal,
      props,
    });
  };

  beforeEach(() => {
    resetSnsProjects();
    page.mock({
      routeId: AppPath.Neuron,
      data: { universe: rootCanisterId.toText() },
    });
    setSnsProjects([snsProjectParams]);

    vi.spyOn(snsNeuronsServices, "increaseStakeNeuron").mockResolvedValue({
      success: true,
    });
    vi.spyOn(snsAccountsServices, "loadSnsAccounts").mockResolvedValue(
      undefined
    );
  });

  describe("accounts and params are loaded", () => {
    beforeEach(() => {
      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: {
          accounts: [mockSnsMainAccount],
          certified: true,
        },
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
        const renderResult: RenderResult<Component> =
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
        const renderResult: RenderResult<Component> =
          await renderSnsIncreaseStakeNeuronModal();

        await enterAmount(renderResult);

        const { getByTestId } = renderResult;

        const confirmButton = getByTestId("transaction-button-execute");
        fireEvent.click(confirmButton);

        expect(increaseStakeNeuron).toBeCalled();
      });

      it("should go back in modal on cancel click", async () => {
        const renderResult: RenderResult<Component> =
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
