/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { accountsStore } from "../../lib/stores/accounts.store";
import { authStore } from "../../lib/stores/auth.store";
import { formatICP } from "../../lib/utils/icp.utils";
import Accounts from "../../routes/Accounts.svelte";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import en from "../mocks/i18n.mock";

describe("Accounts", () => {
  let accountsStoreMock: jest.SpyInstance;

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render title", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(Accounts);

    const title = container.querySelector("h1");
    expect(title).not.toBeNull();
    expect(title).toBeVisible();
    expect(title).toHaveTextContent("Accounts");
  });

  it("should render title and account icp", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(Accounts);

    const titleRow = container.querySelector("section > div");

    expect(titleRow?.textContent).toEqual(
      `Accounts ${formatICP({value: mockMainAccount.balance.toE8s()})} ICP`
    );
  });

  it("should render a main card", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(Accounts);

    const article = container.querySelector("article");
    expect(article).not.toBeNull();
  });

  it("should render account icp in card too", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(Accounts);

    const cardTitleRow = container.querySelector(
      "article > div div:last-of-type"
    );

    expect(cardTitleRow?.textContent).toEqual(
      `${formatICP({value: mockMainAccount.balance.toE8s()})} ICP`
    );
  });

  it("should render account identifier", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { getByText } = render(Accounts);
    getByText(mockMainAccount.identifier);
  });

  it("should render subaccount cards", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
    const { container } = render(Accounts);

    const articles = container.querySelectorAll("article");

    expect(articles).not.toBeNull();
    expect(articles.length).toBe(2);
  });

  it("should render hardware wallet account cards", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
      );
    const { container } = render(Accounts);

    const articles = container.querySelectorAll("article");

    expect(articles).not.toBeNull();
    expect(articles.length).toBe(2);
  });

  it("should render total accounts icp", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe(
          [mockSubAccount],
          [mockHardwareWalletAccount]
        )
      );
    const { container } = render(Accounts);

    const titleRow = container.querySelector("section > div");

    const totalBalance =
      mockMainAccount.balance.toE8s() +
      mockSubAccount.balance.toE8s() +
      mockHardwareWalletAccount.balance.toE8s();
    expect(titleRow?.textContent).toEqual(
      `Accounts ${formatICP({value: totalBalance})} ICP`
    );
  });

  it("should subscribe to store", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    expect(accountsStoreMock).toHaveBeenCalled();
  });

  it("should open transaction modal", async () => {
    const { container, getByText } = render(Accounts);

    const button = container.querySelector(
      '[data-tid="open-new-transaction"]'
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(container.querySelector("div.modal")).not.toBeNull();

      expect(
        getByText(en.accounts.select_source, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("should open add account modal", async () => {
    const { container, getByTestId, getByText } = render(Accounts);

    const button = getByTestId("open-add-account-modal") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(container.querySelector("div.modal")).not.toBeNull();

      expect(
        getByText(en.accounts.attach_hardware_title, { exact: false })
      ).toBeInTheDocument();
    });
  });
});
