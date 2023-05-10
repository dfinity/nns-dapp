import { authStore } from "$lib/stores/auth.store";
import CanisterPage from "$routes/(app)/(nns)/canister/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("Canister page", () => {
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
