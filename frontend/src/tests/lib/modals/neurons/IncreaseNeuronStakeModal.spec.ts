import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import IncreaseNeuronStakeModal from "$lib/modals/neurons/IncreaseNeuronStakeModal.svelte";
import * as neuronsServices from "$lib/services/neurons.services";
import { topUpNeuron } from "$lib/services/neurons.services";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("IncreaseNeuronStakeModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: IncreaseNeuronStakeModal,
      props: {
        neuron: mockNeuron,
      },
    });

  beforeEach(() => {
    resetIdentity();

    vi.spyOn(neuronsServices, "topUpNeuron").mockResolvedValue({
      success: true,
    });
  });

  describe("when accounts store is empty", () => {
    it("should fetch accounts and render account selector", async () => {
      const mainBalanceE8s = 10_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
      const { queryByTestId } = await renderTransactionModal();

      expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();

      // Component is rendered after the accounts are loaded
      await waitFor(() =>
        expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
      );
    });
  });

  describe("when accounts are loaded", () => {
    beforeEach(() => {
      setAccountsForTesting(mockAccountsStoreData);
    });

    it("should tell the user if the top-up was already sent", async () => {
      vi.mocked(topUpNeuron).mockResolvedValue({
        success: true,
        alreadySent: true,
      });

      const { queryAllByText, getByTestId, container } =
        await renderTransactionModal();

      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeInTheDocument()
      );
      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      // Enter amount
      const icpAmount = "1";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBe(false)
      );

      fireEvent.click(participateButton);

      await waitFor(() =>
        expect(getByTestId("transaction-step-2")).toBeTruthy()
      );
      expect(
        queryAllByText(icpAmount, { exact: false }).length
      ).toBeGreaterThan(0);

      const confirmButton = getByTestId("transaction-button-execute");
      fireEvent.click(confirmButton);

      await waitFor(() =>
        expect(get(toastsStore)).toMatchObject([
          {
            level: "success",
            text: en.accounts.transaction_already_sent,
          },
        ])
      );
    });

    it("should call top up neuron", async () => {
      const { queryAllByText, getByTestId, container } =
        await renderTransactionModal();

      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeInTheDocument()
      );
      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      // Enter amount
      const icpAmount = "1";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBe(false)
      );

      fireEvent.click(participateButton);

      await waitFor(() =>
        expect(getByTestId("transaction-step-2")).toBeTruthy()
      );
      expect(
        queryAllByText(icpAmount, { exact: false }).length
      ).toBeGreaterThan(0);

      const confirmButton = getByTestId("transaction-button-execute");
      fireEvent.click(confirmButton);

      await waitFor(() => expect(topUpNeuron).toBeCalled());
    });
  });
});
