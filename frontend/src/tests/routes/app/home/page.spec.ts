import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import HomeRoute from "$routes/(app)/(home)/+page.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { render } from "@testing-library/svelte";

describe("Home page", () => {
  beforeEach(() => {
    setNoIdentity();
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([]);
    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);
  });

  it("should render sign-in button", () => {
    const { getByTestId } = render(HomeRoute);

    expect(getByTestId("login-button")).not.toBeNull();
  });

  it("should render tokens pages", () => {
    const { getByTestId } = render(HomeRoute);

    expect(getByTestId("tokens-route-component")).not.toBeNull();
  });

  describe("when ENABLE_PORTFOLIO_PAGE feature flag is one", () => {
    it("should show the Portfolio page", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_PORTFOLIO_PAGE", true);

      const { queryByTestId } = render(HomeRoute);

      expect(queryByTestId("portfolio-route-component")).not.toBeNull();
      expect(queryByTestId("tokens-route-component")).toBeNull();
    });
  });
});
