/**
 * @jest-environment jsdom
 */

import { AuthStore, authStore } from "../lib/stores/auth.store";
import {
  authStoreMock,
  mockPrincipal,
  mutableMockAuthStoreSubscribe,
} from "./mocks/auth.store.mock";
import { accountsStore } from "../lib/stores/accounts.store";
import { expect } from "@jest/globals";
import { render, waitFor } from "@testing-library/svelte";
import App from "../App.svelte";
import type { Principal } from "@dfinity/principal";

describe("App", () => {
  let accountsStoreMock;

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    accountsStoreMock = jest
      .spyOn(accountsStore, "sync")
      .mockImplementation(async ({ principal }: AuthStore) => {});
  });

  it("every change in the auth store should trigger a synchronization of the accounts store.", async () => {
    render(App);

    await waitFor(() => expect(accountsStoreMock).toHaveBeenCalledTimes(1));

    authStoreMock.next({
      principal: mockPrincipal as Principal,
    });

    expect(accountsStoreMock).toHaveBeenCalledTimes(2);
  });
});
