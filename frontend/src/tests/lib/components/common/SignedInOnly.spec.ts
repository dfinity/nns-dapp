import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import SignedInOnlyTest from "./SignedInOnlyTest.svelte";

describe("SignedInOnly", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should not render slot", () => {
      const { getByTestId } = render(SignedInOnlyTest);
      expect(() => getByTestId("test-slot")).toThrow();
    });
  });

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should render slot", () => {
      const { getByTestId } = render(SignedInOnlyTest);
      expect(getByTestId("test-slot")).not.toBeNull();
    });
  });
});
