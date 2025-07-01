import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as proposalsApi from "$lib/api/proposals.api";
import HomeRoute from "$routes/(app)/(home)/+page.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { render } from "@testing-library/svelte";

describe("Home page", () => {
  beforeEach(() => {
    setNoIdentity();
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([]);
    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockCkBTCToken);
    vi.spyOn(proposalsApi, "queryProposals").mockResolvedValue([]);
  });

  it("should render sign-in button", () => {
    const { getByTestId } = render(HomeRoute);

    expect(getByTestId("login-button")).not.toBeNull();
  });

  it("should show the Portfolio page", () => {
    const { queryByTestId } = render(HomeRoute);

    expect(queryByTestId("portfolio-route-component")).not.toBeNull();
    expect(queryByTestId("tokens-route-component")).toBeNull();
  });
});
