/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import WalletPage from "$routes/(app)/wallet/+page.svelte";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";

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
