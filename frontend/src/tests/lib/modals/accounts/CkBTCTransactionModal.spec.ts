/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import { TokenAmount } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "../../../../lib/constants/ckbtc-canister-ids.constants";
import { icrcAccountsStore } from "../../../../lib/stores/icrc-accounts.store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "../../../mocks/ckbtc-accounts.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { testTransferTokens } from "../../../utils/transaction-modal.test.utils";

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    ckBTCTransferTokens: jest.fn().mockResolvedValue({ success: true }),
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
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });

    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });
  });

  it("should transfer tokens", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({ result, selectedNetwork: true });

    await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());
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
