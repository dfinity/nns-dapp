/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import AccountsPage from "$routes/(app)/accounts/+page.svelte";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";

describe("Accounts page", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  beforeAll(() => {
    authStoreMock.next({
      identity: undefined,
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(AccountsPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
