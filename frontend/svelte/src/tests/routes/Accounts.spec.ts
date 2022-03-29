/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { accountsStore } from "../../lib/stores/accounts.store";
import { authStore } from "../../lib/stores/auth.store";
import { formatICP } from "../../lib/utils/icp.utils";
import Accounts from "../../routes/Accounts.svelte";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";

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
      `Accounts ${formatICP(mockMainAccount.balance.toE8s())} ICP`
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

    const cardTitleRow = container.querySelector("article > div div:last-of-type");

    expect(cardTitleRow?.textContent).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())} ICP`
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

  it("should render total accounts icp", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
    const { container } = render(Accounts);

    const titleRow = container.querySelector("section > div");

    const totalBalance =
      mockMainAccount.balance.toE8s() + mockSubAccount.balance.toE8s();
    expect(titleRow?.textContent).toEqual(
      `Accounts ${formatICP(totalBalance)} ICP`
    );
  });

  it("should subscribe to store", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    expect(accountsStoreMock).toHaveBeenCalled();
  });
});
