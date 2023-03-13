/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import CanisterPage from "$routes/(app)/(nns)/canister/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Canister page", () => {
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
    const { getByTestId } = render(CanisterPage, {
      props: {
        data: {
          canister: "test",
        },
      },
    });

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
