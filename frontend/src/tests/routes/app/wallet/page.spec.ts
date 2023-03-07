/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import WalletPage from "$routes/(app)/(u)/(detail)/wallet/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Wallet page", () => {
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
    const { getByTestId } = render(WalletPage, {
      props: {
        data: {
          account: "test",
        },
      },
    });

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
