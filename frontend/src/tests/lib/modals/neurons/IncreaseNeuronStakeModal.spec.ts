/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import IncreaseNeuronStakeModal from "$lib/modals/neurons/IncreaseNeuronStakeModal.svelte";
import { topUpNeuron } from "$lib/services/neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/icp-ledger.api");
jest.mock("$lib/services/neurons.services", () => {
  return {
    topUpNeuron: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("IncreaseNeuronStakeModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: IncreaseNeuronStakeModal,
      props: {
        neuron: mockNeuron,
      },
    });

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  describe("when accounts store is empty", () => {
    it("should fetch accounts and render account selector", async () => {
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
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
      icpAccountsStore.setForTesting(mockAccountsStoreData);
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
