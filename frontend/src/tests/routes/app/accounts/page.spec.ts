import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { page } from "$mocks/$app/stores";
import AccountsPage from "$routes/(app)/(u)/(accounts)/accounts/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { AccountsPlusPagePo } from "$tests/page-objects/AccountsPlusPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/ckbtc-ledger.api");
vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/sns-ledger.api");

describe("Accounts page", () => {
  const renderComponent = () => {
    const { container } = render(AccountsPage);
    return AccountsPlusPagePo.under(new JestPageObjectElement(container));
  };

  const openSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    icpAccountsStore.resetForTesting();
    vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(mockAccountDetails);
    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(314000000n);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).open = openSpy;
  });

  describe("not logged in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should render sign-in if not logged in", () => {
      const { getByTestId } = render(AccountsPage);

      expect(getByTestId("login-button")).not.toBeNull();
    });

    describe("tokens flag enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      });

      it("renders tokens table for NNS accounts", async () => {
        const po = renderComponent();

        const pagePo = po.getSignInAccountsPo();
        expect(await pagePo.getTokenNames()).toEqual(["Internet Computer"]);
        expect(await pagePo.hasEmptyCards()).toBe(false);
      });
    });

    describe("tokens flag disabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
      });

      it("renders tokens empty cards", async () => {
        const po = renderComponent();

        const pagePo = po.getSignInAccountsPo();
        expect(await pagePo.hasTokensTable()).toBe(false);
        expect(await pagePo.hasEmptyCards()).toBe(true);
      });
    });
  });

  describe("logged in NNS Accounts", () => {
    beforeEach(() => {
      resetIdentity();
      page.mock({
        routeId: AppPath.Accounts,
        data: { universe: OWN_CANISTER_ID_TEXT },
      });
    });

    describe("tokens flag enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      });

      it("renders tokens table for NNS accounts", async () => {
        const po = renderComponent();

        const pagePo = po.getAccountsPo().getNnsAccountsPo();
        expect(await pagePo.hasTokensTable()).toBe(true);
      });
    });

    describe("tokens flag disabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
      });

      it("does not render tokens table for NNS accounts", async () => {
        const po = renderComponent();

        const pagePo = po.getAccountsPo().getNnsAccountsPo();
        expect(await pagePo.hasTokensTable()).toBe(false);
      });

      it("should be able to go and buy icp for the account", async () => {
        const po = renderComponent();

        await runResolvedPromises();

        const pagePo = po.getAccountsPo();
        await pagePo.clickBuyICP();
        await pagePo.clickBuyICP();

        expect(openSpy).not.toHaveBeenCalled();

        const modalPo = pagePo.getBuyICPModalPo();

        await modalPo.clickBanxa();

        // TODO: Change with actual URL
        expect(openSpy).toHaveBeenCalledWith(
          "https://banxa.com/",
          "_blank",
          "width=400,height=600"
        );
      });
    });
  });
});
