/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import SignInGuardTest from "./SignInGuardTest.svelte";

describe("SignInGuard", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should not render slot", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(() => getByTestId("test-slot")).toThrow();
    });

    it("should render sign-in", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should render slot", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(getByTestId("test-slot")).not.toBeNull();
    });

    it("should not render sign-in", () => {
      const { getByTestId } = render(SignInGuardTest);
      expect(() => getByTestId("login-button")).toThrow();
    });
  });
});
