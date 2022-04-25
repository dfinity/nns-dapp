/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { accountsStore } from "../../lib/stores/accounts.store";
import { authStore } from "../../lib/stores/auth.store";
import { routeStore } from "../../lib/stores/route.store";
import Wallet from "../../routes/Wallet.svelte";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import en from "../mocks/i18n.mock";
import { mockRouteStoreSubscibe } from "../mocks/route.store.mock";

describe("Wallet", () => {
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
    const button = container.querySelector("div.toolbar button");

    expect(button).not.toBeNull();
    expect((button as HTMLButtonElement).hasAttribute("disabled")).toEqual(
      disabled
    );
  };

  describe("loading", () => {
    it("should render title", async () => {
      const { getAllByText } = render(Wallet);

      expect(getAllByText(en.wallet.title).length).toBeGreaterThan(0);
    });

    it("should render a spinner while loading", () => {
      const { getByTestId } = render(Wallet);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("new transaction action should be disabled while loading", () => {
      const { container } = render(Wallet);

      testToolbarButton({ container, disabled: true });
    });
  });

  describe("no accounts", () => {
    beforeAll(() => {
      jest
        .spyOn(routeStore, "subscribe")
        .mockImplementation(
          mockRouteStoreSubscibe(`/#/wallet/${mockMainAccount.identifier}`)
        );
    });

    afterAll(() => jest.clearAllMocks());

    it("new transaction should remain disabled if route is valid but store is not loaded", async () => {
      const { container } = render(Wallet);

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

      jest
        .spyOn(routeStore, "subscribe")
        .mockImplementation(
          mockRouteStoreSubscibe(`/#/wallet/${mockMainAccount.identifier}`)
        );
    });

    afterAll(() => jest.clearAllMocks());

    it("should hide spinner when accounts are loaded", async () => {
      const { container } = render(Wallet);

      await waitFor(() =>
        expect(container.querySelector('[data-tid="spinner"]')).toBeNull()
      );
    });

    it("should enable new transaction action for route and store", async () => {
      const { container } = render(Wallet);

      await waitFor(() => testToolbarButton({ container, disabled: false }));
    });

    const testModal = async (container: HTMLElement) => {
      const button = container.querySelector(
        "div.toolbar button"
      ) as HTMLButtonElement;
      await fireEvent.click(button);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    };

    it("should open transaction modal", async () => {
      const { container } = render(Wallet);

      await testModal(container);
    });

    it("should open transaction modal on step select destination because selected account is current account", async () => {
      const { container, getByText } = render(Wallet);

      await testModal(container);

      expect(
        getByText(en.accounts.select_destination, { exact: false })
      ).toBeInTheDocument();
    });
  });
});
