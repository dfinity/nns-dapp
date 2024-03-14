import * as agent from "$lib/api/agent.api";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import HomePage from "$routes/(app)/(home)/+page.svelte";
import type { HttpAgent } from "@dfinity/agent";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("Home page", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();

    // TODO: agent mocked because some calls to global.fetch were exposed when we migrated to agent-js v0.20.2
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("Tokens flag enabled", () => {
    it("should render the tokens route", () => {
      const { queryByTestId } = render(HomePage);

      expect(
        queryByTestId("accounts-plus-page-component")
      ).not.toBeInTheDocument();
      expect(queryByTestId("tokens-route-component")).toBeInTheDocument();
    });
  });
});
