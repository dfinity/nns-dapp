import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { NnsAccountsPo } from "$tests/page-objects/NnsAccounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");

describe("NnsAccounts", () => {
  const renderComponent = (userTokensData: UserTokenData[] = []) => {
    const { container } = render(NnsAccounts, { props: { userTokensData } });
    return NnsAccountsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
      certified: true,
    });
  });

  describe("when tokens flag is enabled", () => {
    it("renders 'Accounts' as tokens table first column", async () => {
      const po = renderComponent();

      const tablePo = po.getTokensTablePo();
      expect(await tablePo.getFirstColumnHeader()).toEqual("Accounts");
    });

    it("should render tokens table with rows", async () => {
      const mainTokenData = createUserToken({
        title: "Main",
        balance: TokenAmount.fromE8s({
          amount: 314000000n,
          token: NNS_TOKEN_DATA,
        }),
      });
      const subaccountTokenData = createUserToken({
        title: "Subaccount test",
        balance: TokenAmount.fromE8s({
          amount: 222000000n,
          token: NNS_TOKEN_DATA,
        }),
      });
      const po = renderComponent([mainTokenData, subaccountTokenData]);
      expect(await po.getTokensTablePo().getRowsData()).toEqual([
        {
          balance: "3.14 ICP",
          projectName: "Main",
        },
        {
          balance: "2.22 ICP",
          projectName: "Subaccount test",
        },
      ]);
    });

    it("should render add account row with tabindex 0", async () => {
      const mainTokenData = createUserToken({
        title: "Main",
        balance: TokenAmount.fromE8s({
          amount: 314000000n,
          token: NNS_TOKEN_DATA,
        }),
      });
      const subaccountTokenData = createUserToken({
        title: "Subaccount test",
        balance: TokenAmount.fromE8s({
          amount: 222000000n,
          token: NNS_TOKEN_DATA,
        }),
      });
      const po = renderComponent([mainTokenData, subaccountTokenData]);
      expect(await po.getAddAccountRowTabindex()).toBe("0");
    });
  });
});
