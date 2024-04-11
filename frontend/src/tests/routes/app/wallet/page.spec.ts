import * as accountsApi from "$lib/api/accounts.api";
import * as icpLedgerApi from "$lib/api/icp-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { page } from "$mocks/$app/stores";
import WalletPage from "$routes/(app)/(u)/(detail)/wallet/+page.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreData,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";

describe("Wallet page", () => {
  beforeEach(() => {
    resetIdentity();

    vi.spyOn(accountsApi, "getTransactions").mockResolvedValue([]);
    vi.spyOn(icpLedgerApi, "queryAccountBalance").mockResolvedValue(0n);

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
