import { goto } from "$app/navigation";
import { AppPath } from "$lib/constants/routes.constants";
import {
  ENABLE_ADDRESS_BOOK,
  overrideFeatureFlagsStore,
} from "$lib/stores/feature-flags.store";
import AddressBookPage from "$routes/(app)/(nns)/address-book/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(() => Promise.resolve()),
}));

describe("Address Book page", () => {
  describe("feature flag off", () => {
    it("should redirect to portfolio when feature flag is disabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_ADDRESS_BOOK", false);
      expect(get(ENABLE_ADDRESS_BOOK)).toBe(false);

      render(AddressBookPage);

      expect(goto).toHaveBeenCalledWith(AppPath.Portfolio);
    });
  });

  describe("not signed in", () => {
    it("should render sign-in if not logged in", () => {
      overrideFeatureFlagsStore.reset();
      setNoIdentity();

      const { getByTestId } = render(AddressBookPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    it("should render address book page when feature flag is enabled and signed in", () => {
      // Feature flag is enabled by default in tests (see vitest.setup.ts)
      expect(get(ENABLE_ADDRESS_BOOK)).toBe(true);
      resetIdentity();

      const { container } = render(AddressBookPage);

      expect(container.querySelector("main")).toBeInTheDocument();
    });
  });
});
