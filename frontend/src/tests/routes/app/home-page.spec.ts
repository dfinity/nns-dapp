import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import HomePage from "$routes/(app)/(u)/(accounts)/+page.svelte";
import { render } from "@testing-library/svelte";

describe("Home page", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  describe("My Tokens flag enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
    });

    it("should render the tokens route", () => {
      const { queryByTestId } = render(HomePage);

      expect(
        queryByTestId("accounts-plus-page-component")
      ).not.toBeInTheDocument();
      expect(queryByTestId("tokens-route-component")).toBeInTheDocument();
    });
  });

  describe("My Tokens flag disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
    });

    it("should render the accounts route", () => {
      const { queryByTestId } = render(HomePage);

      expect(queryByTestId("accounts-plus-page-component")).toBeInTheDocument();
      expect(queryByTestId("tokens-route-component")).not.toBeInTheDocument();
    });
  });
});
