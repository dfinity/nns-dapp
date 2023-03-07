/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import CanistersPage from "$routes/(app)/(nns)/canisters/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Canisters page", () => {
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
    const { getByTestId } = render(CanistersPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
