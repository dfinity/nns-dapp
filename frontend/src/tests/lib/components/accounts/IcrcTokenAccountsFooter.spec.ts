import * as walletLedgerApi from "$lib/api/wallet-ledger.api";
import IcrcTokenAccountsFooter from "$lib/components/accounts/IcrcTokenAccountsFooter.svelte";
import {
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkETHMainAccount,
  mockCkETHToken,
} from "$tests/mocks/cketh-accounts.mock";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("IcrcTokenAccountsFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();

    vi.spyOn(walletLedgerApi, "getToken").mockResolvedValue(mockCkETHToken);
    vi.spyOn(walletLedgerApi, "getAccount").mockResolvedValue(
      mockCkETHMainAccount
    );

    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETH_INDEX_CANISTER_ID,
    });

    overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);

    tokensStore.setTokens(mockTokens);

    page.mock({
      data: {
        universe: CKETH_UNIVERSE_CANISTER_ID.toText(),
        routeId: AppPath.Accounts,
      },
    });
  });

  const modalProps = {
    testComponent: IcrcTokenAccountsFooter,
  };

  it("should sync accounts after finish receiving tokens", async () => {
    const result = render(AccountsTest, { props: modalProps });

    await testAccountsModal({ result, testId: "receive-icrc" });

    const { getByTestId, container } = result;

    await waitModalIntroEnd({ container, selector: modalToolbarSelector });

    await waitFor(() => expect(getByTestId("receive-modal")).not.toBeNull());

    expect(walletLedgerApi.getAccount).toBeCalledTimes(0);

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    // Query + Update calls
    await waitFor(() => expect(walletLedgerApi.getAccount).toBeCalledTimes(2));
  });
});
