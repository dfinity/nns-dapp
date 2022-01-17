/**
 * @jest-environment jsdom
 */

import { authStore } from "../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import { mockAccountsStoreSubscribe } from "../mocks/accounts.store.mock";
import { accountsStore } from "../../lib/stores/accounts.store";
import {render} from '@testing-library/svelte';
import Accounts from '../../routes/Accounts.svelte';

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
});
