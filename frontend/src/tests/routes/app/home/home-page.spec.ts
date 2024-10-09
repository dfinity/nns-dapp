import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import HomePage from "$routes/(app)/(home)/+page.svelte";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { render } from "@testing-library/svelte";

describe("Home page", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();

    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);
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
