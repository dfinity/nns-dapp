import { authStore } from "$lib/stores/auth.store";
import AccountsPage from "$routes/(app)/(u)/(list)/accounts/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("Accounts page", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

  beforeAll(() => {
    authStoreMock.next({
      identity: undefined,
    });
  });

  afterAll(() => vi.clearAllMocks());

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(AccountsPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
