import * as governanceApi from "$lib/api/governance.api";
import * as indexApi from "$lib/api/icp-index.api";
import * as icpLedgerApi from "$lib/api/icp-ledger.api";
import * as icpSwapApi from "$lib/api/icp-swap.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { page } from "$mocks/$app/stores";
import WalletPage from "$routes/(app)/(u)/(detail)/wallet/+page.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreData,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockEmptyGetTransactionsResponse } from "$tests/mocks/transaction.mock";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";

describe("Wallet page", () => {
  const tickers = [
    {
      ...mockIcpSwapTicker,
      base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
      last_price: "10.00",
    },
  ];

  beforeEach(() => {
    resetIdentity();

    vi.spyOn(indexApi, "getTransactions").mockResolvedValue(
      mockEmptyGetTransactionsResponse
    );
    vi.spyOn(icpLedgerApi, "queryAccountBalance").mockResolvedValue(0n);
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Wallet,
    });
  });

  const renderWallet = (accountIdentifier: string) => {
    const { container } = render(WalletPage, {
      props: {
        data: {
          account: accountIdentifier,
        },
      },
    });
    return new WalletPo(new JestPageObjectElement(container));
  };

  it("should pass the account identifier", async () => {
    const testAccountIdentifier = "test-account";
    setAccountsForTesting({
      ...mockAccountsStoreData,
      subAccounts: [
        {
          ...mockSubAccount,
          identifier: testAccountIdentifier,
        },
      ],
    });

    const po = renderWallet(testAccountIdentifier);

    expect(
      await po.getNnsWalletPo().getWalletPageHeaderPo().getWalletAddress()
    ).toBe(testAccountIdentifier);
  });
});
