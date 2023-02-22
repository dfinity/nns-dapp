/**
 * @jest-environment jsdom
 */

import NnsWallet from "$lib/pages/NnsWallet.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";

jest.mock("$lib/services/accounts.services", () => ({
  ...(jest.requireActual("$lib/services/accounts.services") as object),
  getAccountTransactions: jest.fn(),
}));

describe("NnsWallet", () => {
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  const testToolbarButton = ({
    container,
    disabled,
  }: {
    container: HTMLElement;
    disabled: boolean;
  }) => {
    const button = container.querySelector("footer div.toolbar button");

    expect(button).not.toBeNull();
    expect((button as HTMLButtonElement).hasAttribute("disabled")).toEqual(
      disabled
    );
  };

  describe("loading", () => {
    it("should render a spinner while loading", () => {
      const { getByTestId } = render(NnsWallet);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("new transaction action should be disabled while loading", () => {
      const { container } = render(NnsWallet);

      testToolbarButton({ container, disabled: true });
    });
  });

  describe("no accounts", () => {
    const props = {
      accountIdentifier: mockMainAccount.identifier,
    };

    it("new transaction should remain disabled if route is valid but store is not loaded", async () => {
      const { container } = render(NnsWallet, props);

      // init
      testToolbarButton({ container, disabled: true });

      await tick();

      // route set triggers get account
      testToolbarButton({ container, disabled: true });
    });
  });

  describe("accounts loaded", () => {
    beforeAll(() => {
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(mockAccountsStoreSubscribe());
    });

    afterAll(() => jest.clearAllMocks());

    const props = {
      accountIdentifier: mockMainAccount.identifier,
    };

    it("should render nns project name", async () => {
      const { getByTestId } = render(NnsWallet, props);

      const titleRow = getByTestId("projects-summary");

      expect(titleRow).not.toBeNull();
    });

    it("should hide spinner when selected account is loaded", async () => {
      const { container } = render(NnsWallet, props);

      await waitFor(() =>
        expect(container.querySelector('[data-tid="spinner"]')).toBeNull()
      );
    });

    it("should enable new transaction action for route and store", async () => {
      const { container } = render(NnsWallet, props);

      await waitFor(() => testToolbarButton({ container, disabled: false }));
    });

    const testModal = async (container: HTMLElement) => {
      const button = container.querySelector(
        "footer div.toolbar button"
      ) as HTMLButtonElement;
      await fireEvent.click(button);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    };

    it("should open transaction modal", async () => {
      const { container } = render(NnsWallet, props);

      await testModal(container);
    });

    it("should open transaction modal on step select destination because selected account is current account", async () => {
      const { container, getByTestId } = render(NnsWallet, props);

      await testModal(container);

      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeInTheDocument()
      );
    });

    it("should display SkeletonCard while loading transactions", async () => {
      const { getByTestId } = render(NnsWallet, props);

      expect(getByTestId("skeleton-card")).toBeInTheDocument();
    });
  });

  describe("accounts loaded (Hardware Wallet)", () => {
    beforeAll(() => {
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(
          mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
        );
    });

    const props = {
      accountIdentifier: mockHardwareWalletAccount.identifier,
    };

    afterAll(() => jest.clearAllMocks());

    it("should display principal", async () => {
      const { queryByText } = render(NnsWallet, props);
      const principal = mockHardwareWalletAccount?.principal?.toString();

      expect(principal?.length).toBeGreaterThan(0);
      expect(
        queryByText(`${principal}`, {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
