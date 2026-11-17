import { goto } from "$app/navigation";
import * as governanceApi from "$lib/api/governance.api";
import { AppPath } from "$lib/constants/routes.constants";
import {
  ENABLE_HOTKEYS_PAGE,
  overrideFeatureFlagsStore,
} from "$lib/stores/feature-flags.store";
import HotkeysPage from "$routes/(app)/(nns)/hotkeys/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(() => Promise.resolve()),
}));

describe("Hotkeys page", () => {
  beforeEach(() => {
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
  });

  describe("feature flag off", () => {
    it("should redirect to portfolio when feature flag is disabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_HOTKEYS_PAGE", false);
      expect(get(ENABLE_HOTKEYS_PAGE)).toBe(false);
      resetIdentity();

      const { queryByTestId } = render(HotkeysPage);

      expect(goto).toHaveBeenCalledWith(AppPath.Portfolio);
      expect(queryByTestId("hotkeys-content")).toBeNull();
    });
  });

  describe("not signed in", () => {
    it("should render sign-in if not logged in", () => {
      setNoIdentity();

      const { getByTestId } = render(HotkeysPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });

  describe("signed in", () => {
    it("should render the hotkeys page when feature flag is enabled and signed in", () => {
      // Feature flag is enabled by default in tests (see vitest.setup.ts)
      expect(get(ENABLE_HOTKEYS_PAGE)).toBe(true);
      resetIdentity();

      const { getByTestId } = render(HotkeysPage);

      expect(getByTestId("hotkeys-content")).not.toBeNull();
      expect(goto).not.toHaveBeenCalled();
    });
  });
});
