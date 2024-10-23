import SettingsPage from "$routes/(app)/(nns)/settings/+page.svelte";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";

describe("Settings page", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should render sign-in if not logged in", () => {
      const { getByTestId } = render(SettingsPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render principal", () => {
      const { getByText } = render(SettingsPage);

      expect(
        getByText(mockIdentity.getPrincipal().toText())
      ).toBeInTheDocument();
    });
  });
});
