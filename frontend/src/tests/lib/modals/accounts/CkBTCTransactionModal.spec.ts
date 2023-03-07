/**
 * @jest-environment jsdom
 */

import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";
import { convertCkBTCToBtc } from "$lib/services/ckbtc-convert.services";
import { authStore } from "$lib/stores/auth.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { TransactionNetwork } from "$lib/types/transaction";
import { page } from "$mocks/$app/stores";
import { TokenAmount } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { testTransferTokens } from "$tests/utils/transaction-modal.test.utils";

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    ckBTCTransferTokens: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/services/ckbtc-convert.services", () => {
  return {
    convertCkBTCToBtc: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("CkBTCTransactionModal", () => {
  const renderTransactionModal = (selectedAccount?: Account) =>
    renderModal({
      component: CkBTCTransactionModal,
      props: {
        selectedAccount,
        token: mockCkBTCToken,
        transactionFee: TokenAmount.fromE8s({
          amount: mockCkBTCToken.fee,
          token: mockCkBTCToken,
        }),
        canisters: mockCkBTCAdditionalCanisters,
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      },
    });

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  beforeAll(() => {
    icrcAccountsStore.set({
      accounts: {
        accounts: [mockCkBTCMainAccount],
        certified: true,
      },
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    });

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });
  });

  it("should transfer tokens", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP_CKBTC,
    });

    await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());
  });

  it("should convert ckBTC to Bitcoin", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.BITCOIN,
    });

    await waitFor(() => expect(convertCkBTCToBtc).toBeCalled());
  });

  it("should not render the select account dropdown if selected account is passed", async () => {
    const { queryByTestId } = await renderTransactionModal(
      mockCkBTCMainAccount
    );

    await waitFor(() =>
      expect(queryByTestId("transaction-step-1")).toBeInTheDocument()
    );
    expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();
  });
});
