import * as agent from "$lib/api/agent.api";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import HomePage from "$routes/(app)/(u)/(accounts)/+page.svelte";
import type { HttpAgent } from "@dfinity/agent";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("Home page", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
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
