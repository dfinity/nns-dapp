/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";
import SignedInOnlyTest from "./SignedInOnlyTest.svelte";

describe("SignedInOnly", () => {
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
