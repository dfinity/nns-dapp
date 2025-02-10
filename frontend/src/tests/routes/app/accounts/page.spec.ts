import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { page } from "$mocks/$app/stores";
import AccountsPage from "$routes/(app)/(u)/(list)/accounts/+page.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { AccountsPlusPagePo } from "$tests/page-objects/AccountsPlusPage.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/sns-ledger.api");

describe("Accounts page", () => {
  const renderComponent = () => {
    const { container } = render(AccountsPage);
    return AccountsPlusPagePo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(mockAccountDetails);
    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(314000000n);
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
      it("renders tokens table for NNS accounts", async () => {
        const po = renderComponent();

        const pagePo = po.getSignInAccountsPo();
        expect(await pagePo.getTokenNames()).toEqual(["Internet Computer"]);
        expect(await pagePo.hasEmptyCards()).toBe(false);
      });

      it("should render Internet Computer row with href to wallet page", async () => {
        const po = renderComponent();

        const icpRow = await po
          .getSignInAccountsPo()
          .getTokensTablePo()
          .getRowByName("Internet Computer");
        expect(await icpRow.getHref()).toEqual(
          `/wallet/?u=${OWN_CANISTER_ID_TEXT}`
        );
      });

      it("renders 'Accounts' as tokens first column", async () => {
        const po = renderComponent();

        const tablePo = po.getSignInAccountsPo().getTokensTablePo();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Accounts");
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
      it("renders tokens table for NNS accounts", async () => {
        const po = renderComponent();

        const pagePo = po.getAccountsPo().getNnsAccountsPo();
        expect(await pagePo.hasTokensTable()).toBe(true);
      });

      it("renders 'Accounts' as tokens table first column", async () => {
        const po = renderComponent();

        const tablePo = po
          .getAccountsPo()
          .getNnsAccountsPo()
          .getTokensTablePo();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Accounts");
      });
    });
  });
});
