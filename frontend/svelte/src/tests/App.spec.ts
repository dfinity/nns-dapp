/**
 * @jest-environment jsdom
 */

import { AuthStore, authStore } from "../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "./mocks/auth.store.mock";
import { accountsStore } from "../lib/stores/accounts.store";
import { expect } from "@jest/globals";
import { render } from "@testing-library/svelte";
import App from "../App.svelte";

describe("App", () => {
  let authStoreMock, accountsStoreMock;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    accountsStoreMock = jest
      .spyOn(accountsStore, "sync")
      .mockImplementation(async ({ principal }: AuthStore) => {});
  });

  it("should sync accounts store", async () => {
    render(App);

    expect(accountsStoreMock).toHaveBeenCalledTimes(1);
  });
});
