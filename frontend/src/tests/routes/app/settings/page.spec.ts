import { authStore } from "$lib/stores/auth.store";
import SettingsPage from "$routes/(app)/(nns)/settings/+page.svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { mockIdentity } from "../../../mocks/auth.store.mock";

describe("Settings page", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should render sign-in if not logged in", () => {
      const { getByTestId } = render(SettingsPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should render principal", () => {
      const { getByText } = render(SettingsPage);

      expect(
        getByText(mockIdentity.getPrincipal().toText())
      ).toBeInTheDocument();
    });
  });
});
