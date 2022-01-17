/**
 * @jest-environment jsdom
 */

import { authStore } from "../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../mocks/accounts.store.mock";
import { accountsStore } from "../../lib/stores/accounts.store";
import { render } from "@testing-library/svelte";
import Accounts from "../../routes/Accounts.svelte";
import { formatICP } from "../../lib/utils/icp.utils";

describe("Accounts", () => {
  let authStoreMock, accountsStoreMock;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe);
  });

  it("should render title", () => {
    const { container } = render(Accounts);

    const title = container.querySelector("h1");
    expect(title).not.toBeUndefined();
    expect(title).toBeVisible();
    expect(title).toHaveTextContent("Accounts");
  });

  it("should render title and account icp", () => {
    const { container } = render(Accounts);

    const titleRow = container.querySelector("section > div");

    expect(titleRow.textContent).toEqual(
      `Accounts ${formatICP(mockMainAccount.balance.toE8s())} ICP`
    );
  });

  it("should render a main card", () => {
    const { container } = render(Accounts);

    const article = container.querySelector("article");
    expect(article).not.toBeUndefined();
  });

  it("should render account icp in card too", () => {
    const { container } = render(Accounts);

    const cardTitleRow = container.querySelector("article > div > div");

    expect(cardTitleRow.textContent).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())} ICP`
    );
  });

  it("should render account identifier", () => {
    const { getByText } = render(Accounts);
    getByText(mockMainAccount.identifier);
  });

  it("should subscribe to store", () =>
    expect(accountsStoreMock).toHaveBeenCalled());
});
